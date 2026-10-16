import { ConflictError, NotFoundError } from '../common/exceptions/app-errors';
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

  describe('createCategory', () => {
    function createInsertDbMock(maxRows: { displayOrder: number }[]) {
      const selectMock = jest.fn().mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(maxRows),
          }),
        }),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const valuesMock = jest.fn((input: any) => ({
        returning: jest.fn().mockResolvedValue([{ id: 'cat-new', ...input }]),
      }));
      const insertMock = jest.fn().mockReturnValue({ values: valuesMock });
      return { dbMock: { select: selectMock, insert: insertMock }, valuesMock };
    }

    it('should create a category with displayOrder one above the current max', async () => {
      // Arrange
      const { dbMock, valuesMock } = createInsertDbMock([{ displayOrder: 2 }]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const created = await service.createCategory({
        name: 'General Discussion',
        description: 'Talk about anything',
        visibility: 'public',
      });

      // Assert
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'General Discussion',
          description: 'Talk about anything',
          visibility: 'public',
          displayOrder: 3,
        }),
      );
      expect(created.id).toBe('cat-new');
      expect(created.displayOrder).toBe(3);
      expect(created.forums).toEqual([]);
    });

    it('should start at displayOrder 0 when no categories exist', async () => {
      // Arrange
      const { dbMock, valuesMock } = createInsertDbMock([]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const created = await service.createCategory({ name: 'First Category' });

      // Assert
      expect(valuesMock).toHaveBeenCalledWith(expect.objectContaining({ displayOrder: 0 }));
      expect(created.displayOrder).toBe(0);
    });

    it('should default visibility to public and description to null', async () => {
      // Arrange
      const { dbMock, valuesMock } = createInsertDbMock([]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      await service.createCategory({ name: 'General Discussion' });

      // Assert
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({ visibility: 'public', description: null }),
      );
    });
  });

  describe('createForum', () => {
    const CATEGORY_ID = '11111111-1111-4111-8111-111111111111';

    function createForumDbMock(queues: unknown[][]) {
      let calls = 0;
      const selectMock = jest.fn().mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockImplementation(() => Promise.resolve(queues[calls++])),
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockImplementation(() => Promise.resolve(queues[calls++])),
            }),
          }),
        }),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const valuesMock = jest.fn((input: any) => ({
        returning: jest.fn().mockResolvedValue([{ id: 'forum-new', ...input }]),
      }));
      const insertMock = jest.fn().mockReturnValue({ values: valuesMock });
      return { dbMock: { select: selectMock, insert: insertMock }, valuesMock };
    }

    it('should create a top-level forum with displayOrder above the sibling max', async () => {
      // Arrange
      const { dbMock, valuesMock } = createForumDbMock([
        [{ id: CATEGORY_ID }],
        [{ displayOrder: 1 }],
      ]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const created = await service.createForum({ categoryId: CATEGORY_ID, name: 'News' });

      // Assert
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: CATEGORY_ID,
          parentForumId: null,
          name: 'News',
          displayOrder: 2,
        }),
      );
      expect(created.id).toBe('forum-new');
    });

    it('should create a nested forum scoped to the same category', async () => {
      // Arrange
      const { dbMock, valuesMock } = createForumDbMock([
        [{ id: CATEGORY_ID }],
        [{ id: 'forum-parent', categoryId: CATEGORY_ID }],
        [],
      ]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const created = await service.createForum({
        categoryId: CATEGORY_ID,
        parentForumId: 'forum-parent',
        name: 'Patch Notes',
      });

      // Assert
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: CATEGORY_ID,
          parentForumId: 'forum-parent',
          displayOrder: 0,
        }),
      );
      expect(created.id).toBe('forum-new');
    });

    it('should throw NotFoundError for a missing category', async () => {
      // Arrange
      const { dbMock, valuesMock } = createForumDbMock([[]]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act + Assert
      await expect(service.createForum({ categoryId: CATEGORY_ID, name: 'News' })).rejects.toThrow(
        NotFoundError,
      );
      expect(valuesMock).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError for a missing parent forum', async () => {
      // Arrange
      const { dbMock, valuesMock } = createForumDbMock([[{ id: CATEGORY_ID }], []]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act + Assert
      await expect(
        service.createForum({
          categoryId: CATEGORY_ID,
          parentForumId: 'forum-ghost',
          name: 'News',
        }),
      ).rejects.toThrow(NotFoundError);
      expect(valuesMock).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when the parent belongs to another category', async () => {
      // Arrange
      const { dbMock, valuesMock } = createForumDbMock([
        [{ id: CATEGORY_ID }],
        [{ id: 'forum-other', categoryId: 'other-category' }],
      ]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act + Assert
      await expect(
        service.createForum({
          categoryId: CATEGORY_ID,
          parentForumId: 'forum-other',
          name: 'News',
        }),
      ).rejects.toThrow(NotFoundError);
      expect(valuesMock).not.toHaveBeenCalled();
    });
  });

  describe('updateForum', () => {
    const FORUM_ID = '22222222-2222-4222-8222-222222222222';

    function forumRow(overrides: Record<string, unknown> = {}) {
      return {
        id: FORUM_ID,
        categoryId: '11111111-1111-4111-8111-111111111111',
        parentForumId: null,
        name: 'Announcements',
        description: null,
        visibility: 'public',
        displayOrder: 0,
        ...overrides,
      };
    }

    function createUpdateDbMock(lookupRows: unknown[]) {
      const selectMock = jest.fn().mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(lookupRows),
          }),
        }),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setMock = jest.fn((input: any) => ({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ ...forumRow(), ...input }]),
        }),
      }));
      const updateMock = jest.fn().mockReturnValue({ set: setMock });
      return { dbMock: { select: selectMock, update: updateMock }, setMock };
    }

    it('should apply a partial name update and return the updated forum', async () => {
      // Arrange
      const { dbMock, setMock } = createUpdateDbMock([forumRow()]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const updated = await service.updateForum(FORUM_ID, { name: 'New Name' });

      // Assert
      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Name' }));
      expect(updated.name).toBe('New Name');
      expect(updated.id).toBe(FORUM_ID);
    });

    it('should apply a description update', async () => {
      // Arrange
      const { dbMock, setMock } = createUpdateDbMock([forumRow()]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const updated = await service.updateForum(FORUM_ID, { description: 'Fresh news' });

      // Assert
      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ description: 'Fresh news' }));
      expect(updated.description).toBe('Fresh news');
    });

    it('should return the current forum without updating when the dto is empty', async () => {
      // Arrange
      const { dbMock } = createUpdateDbMock([forumRow()]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const updated = await service.updateForum(FORUM_ID, {});

      // Assert
      expect(dbMock.update).not.toHaveBeenCalled();
      expect(updated.id).toBe(FORUM_ID);
      expect(updated.name).toBe('Announcements');
    });

    it('should throw NotFoundError for a missing forum', async () => {
      // Arrange
      const { dbMock } = createUpdateDbMock([]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act + Assert
      await expect(service.updateForum(FORUM_ID, { name: 'New Name' })).rejects.toThrow(
        NotFoundError,
      );
      expect(dbMock.update).not.toHaveBeenCalled();
    });
  });

  describe('changeForumVisibility', () => {
    const FORUM_ID = '22222222-2222-4222-8222-222222222222';

    function createVisibilityDbMock(lookupRows: unknown[]) {
      const selectMock = jest.fn().mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(lookupRows),
          }),
        }),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setMock = jest.fn((input: any) => ({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            {
              id: FORUM_ID,
              categoryId: '11111111-1111-4111-8111-111111111111',
              parentForumId: null,
              name: 'Announcements',
              description: null,
              visibility: input.visibility,
              displayOrder: 0,
            },
          ]),
        }),
      }));
      const updateMock = jest.fn().mockReturnValue({ set: setMock });
      return { dbMock: { select: selectMock, update: updateMock }, setMock };
    }

    it('should change visibility and return the updated forum', async () => {
      // Arrange
      const { dbMock, setMock } = createVisibilityDbMock([{ id: FORUM_ID }]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const updated = await service.changeForumVisibility(FORUM_ID, {
        visibility: 'registered',
      });

      // Assert
      expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ visibility: 'registered' }));
      expect(updated.visibility).toBe('registered');
      expect(updated.id).toBe(FORUM_ID);
    });

    it('should throw NotFoundError for a missing forum', async () => {
      // Arrange
      const { dbMock } = createVisibilityDbMock([]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act + Assert
      await expect(
        service.changeForumVisibility(FORUM_ID, { visibility: 'public' }),
      ).rejects.toThrow(NotFoundError);
      expect(dbMock.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteForum', () => {
    const FORUM_ID = '22222222-2222-4222-8222-222222222222';

    function createDeleteDbMock(queues: unknown[][]) {
      let calls = 0;
      const selectMock = jest.fn().mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockImplementation(() => Promise.resolve(queues[calls++])),
          }),
        }),
      }));
      const whereMock = jest.fn().mockResolvedValue(undefined);
      const deleteMock = jest.fn().mockReturnValue({ where: whereMock });
      return { dbMock: { select: selectMock, delete: deleteMock }, deleteMock };
    }

    it('should delete a forum with no active topics or sub-forums', async () => {
      // Arrange
      const { dbMock, deleteMock } = createDeleteDbMock([[{ id: FORUM_ID }], [], []]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act
      const result = await service.deleteForum(FORUM_ID);

      // Assert
      expect(deleteMock).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundError for a missing forum', async () => {
      // Arrange
      const { dbMock, deleteMock } = createDeleteDbMock([[]]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act + Assert
      await expect(service.deleteForum(FORUM_ID)).rejects.toThrow(NotFoundError);
      expect(deleteMock).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when the forum has active topics', async () => {
      // Arrange
      const { dbMock, deleteMock } = createDeleteDbMock([[{ id: FORUM_ID }], [{ id: 'topic-1' }]]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act + Assert
      await expect(service.deleteForum(FORUM_ID)).rejects.toThrow(ConflictError);
      expect(deleteMock).not.toHaveBeenCalled();
    });

    it('should throw ConflictError when the forum has sub-forums', async () => {
      // Arrange
      const { dbMock, deleteMock } = createDeleteDbMock([
        [{ id: FORUM_ID }],
        [],
        [{ id: 'forum-child' }],
      ]);
      const service = new ForumsService(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dbMock as any,
      );

      // Act + Assert
      await expect(service.deleteForum(FORUM_ID)).rejects.toThrow(ConflictError);
      expect(deleteMock).not.toHaveBeenCalled();
    });
  });
});
