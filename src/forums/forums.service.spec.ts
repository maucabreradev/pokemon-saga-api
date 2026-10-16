import { NotFoundError } from '../common/exceptions/app-errors';
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

  describe('getForumDetail', () => {
    interface DetailRow {
      id: string;
      parentForumId: string | null;
      name: string;
      description: string | null;
      visibility: 'public' | 'registered' | 'characters_only';
      displayOrder: number;
    }

    function createDetailDbMock(queues: unknown[][]) {
      let calls = 0;
      const selectMock = jest.fn().mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockImplementation(() => Promise.resolve(queues[calls++])),
            orderBy: jest.fn().mockImplementation(() => Promise.resolve(queues[calls++])),
            then: (resolve: (value: unknown) => void) => {
              resolve(queues[calls++]);
            },
          }),
        }),
      }));
      return { dbMock: { select: selectMock } };
    }

    function detailRow(overrides: Partial<DetailRow> & { id: string }): DetailRow {
      return {
        parentForumId: null,
        name: 'Forum',
        description: null,
        visibility: 'public',
        displayOrder: 0,
        ...overrides,
      };
    }

    it('should return forum detail with immediate children, breadcrumb, and topic count', async () => {
      // Arrange
      const { dbMock } = createDetailDbMock([
        [detailRow({ id: 'forum-1', parentForumId: 'forum-root', displayOrder: 1 })],
        [detailRow({ id: 'forum-child', parentForumId: 'forum-1' })],
        [detailRow({ id: 'forum-root', name: 'Root' })],
        [{ id: 'topic-1' }, { id: 'topic-2' }],
      ]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const detail = await service.getForumDetail('forum-1');

      // Assert
      expect(detail.id).toBe('forum-1');
      expect(detail.subForums).toHaveLength(1);
      expect(detail.subForums[0].id).toBe('forum-child');
      expect(detail.breadcrumb).toEqual([{ id: 'forum-root', name: 'Root' }]);
      expect(detail.topicCount).toBe(2);
    });

    it('should throw NotFoundError for a missing forum', async () => {
      // Arrange
      const { dbMock } = createDetailDbMock([[]]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act + Assert
      await expect(service.getForumDetail('missing')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError for a non-public forum without leaking it', async () => {
      // Arrange
      const { dbMock } = createDetailDbMock([[]]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act + Assert
      await expect(service.getForumDetail('forum-hidden')).rejects.toThrow(NotFoundError);
      expect(dbMock.select).toHaveBeenCalledTimes(1);
    });

    it('should build a multi-level breadcrumb root-first', async () => {
      // Arrange
      const { dbMock } = createDetailDbMock([
        [detailRow({ id: 'forum-1', parentForumId: 'forum-parent' })],
        [],
        [detailRow({ id: 'forum-parent', parentForumId: 'forum-root', name: 'Parent' })],
        [detailRow({ id: 'forum-root', name: 'Root' })],
        [],
      ]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const detail = await service.getForumDetail('forum-1');

      // Assert
      expect(detail.breadcrumb).toEqual([
        { id: 'forum-root', name: 'Root' },
        { id: 'forum-parent', name: 'Parent' },
      ]);
    });

    it('should stop the breadcrumb walk on a parent cycle', async () => {
      // Arrange
      const { dbMock } = createDetailDbMock([
        [detailRow({ id: 'forum-a', parentForumId: 'forum-b', name: 'A' })],
        [],
        [detailRow({ id: 'forum-b', parentForumId: 'forum-a', name: 'B' })],
        [],
      ]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const detail = await service.getForumDetail('forum-a');

      // Assert
      expect(detail.breadcrumb).toEqual([{ id: 'forum-b', name: 'B' }]);
    });

    it('should return empty sub-forums and breadcrumb for a root forum', async () => {
      // Arrange
      const { dbMock } = createDetailDbMock([
        [detailRow({ id: 'forum-root', name: 'Root' })],
        [],
        [],
      ]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const detail = await service.getForumDetail('forum-root');

      // Assert
      expect(detail.subForums).toEqual([]);
      expect(detail.breadcrumb).toEqual([]);
      expect(detail.topicCount).toBe(0);
    });
  });
});
