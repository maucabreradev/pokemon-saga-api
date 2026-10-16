import { ForumsService } from './forums.service';

jest.mock('../database/database.module', () => ({
  DRIZZLE: Symbol('DRIZZLE'),
}));

interface Row {
  id: string;
  categoryId?: string;
  parentForumId: string | null;
  name: string;
  description: string | null;
  visibility: 'public' | 'registered' | 'characters_only';
  displayOrder: number;
}

function createDbMock(categoryRows: Row[], forumRows: Row[]) {
  const tables = [categoryRows, forumRows];
  let selectCalls = 0;

  const selectMock = jest.fn().mockImplementation(() => ({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockResolvedValue(tables[selectCalls++]),
      }),
    }),
  }));

  return { dbMock: { select: selectMock }, selectMock };
}

describe('ForumsService', () => {
  describe('getTree', () => {
    it('should return categories with nested forums ordered by displayOrder', async () => {
      // Arrange
      const categoryRows: Row[] = [
        {
          id: 'cat-1',
          parentForumId: null,
          name: 'General',
          description: null,
          visibility: 'public',
          displayOrder: 0,
        },
      ];
      const forumRows: Row[] = [
        {
          id: 'forum-parent',
          categoryId: 'cat-1',
          parentForumId: null,
          name: 'Announcements',
          description: null,
          visibility: 'public',
          displayOrder: 0,
        },
        {
          id: 'forum-child',
          categoryId: 'cat-1',
          parentForumId: 'forum-parent',
          name: 'Patch Notes',
          description: null,
          visibility: 'public',
          displayOrder: 1,
        },
      ];
      const { dbMock } = createDbMock(categoryRows, forumRows);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const tree = await service.getTree();

      // Assert
      expect(tree).toHaveLength(1);
      expect(tree[0].id).toBe('cat-1');
      expect(tree[0].forums).toHaveLength(1);
      expect(tree[0].forums[0].id).toBe('forum-parent');
      expect(tree[0].forums[0].forums).toHaveLength(1);
      expect(tree[0].forums[0].forums[0].id).toBe('forum-child');
    });

    it('should only query public categories and forums (guest filtering)', async () => {
      // Arrange
      const { dbMock, selectMock } = createDbMock([], []);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      await service.getTree();

      // Assert
      expect(selectMock).toHaveBeenCalledTimes(2);
    });

    it('should attach orphan forums as roots when their parent is not public', async () => {
      // Arrange
      const categoryRows: Row[] = [
        {
          id: 'cat-1',
          parentForumId: null,
          name: 'General',
          description: null,
          visibility: 'public',
          displayOrder: 0,
        },
      ];
      const forumRows: Row[] = [
        {
          id: 'forum-orphan',
          categoryId: 'cat-1',
          parentForumId: 'forum-hidden',
          name: 'Orphan',
          description: null,
          visibility: 'public',
          displayOrder: 0,
        },
      ];
      const { dbMock } = createDbMock(categoryRows, forumRows);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const tree = await service.getTree();

      // Assert
      expect(tree[0].forums).toHaveLength(1);
      expect(tree[0].forums[0].id).toBe('forum-orphan');
    });

    it('should return empty forums array for categories without forums', async () => {
      // Arrange
      const categoryRows: Row[] = [
        {
          id: 'cat-empty',
          parentForumId: null,
          name: 'Empty',
          description: null,
          visibility: 'public',
          displayOrder: 0,
        },
      ];
      const { dbMock } = createDbMock(categoryRows, []);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const tree = await service.getTree();

      // Assert
      expect(tree).toHaveLength(1);
      expect(tree[0].forums).toEqual([]);
    });

    it('should return empty array when no public categories exist', async () => {
      // Arrange
      const { dbMock } = createDbMock([], []);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const tree = await service.getTree();

      // Assert
      expect(tree).toEqual([]);
    });
  });
});
