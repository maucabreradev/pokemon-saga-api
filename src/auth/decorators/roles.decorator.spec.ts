import { ROLES_KEY, Roles } from './roles.decorator';

describe('Roles', () => {
  it('should mark a handler with the required roles via metadata', () => {
    class TestController {
      @Roles('admin')
      adminRoute() {
        return 'admin';
      }

      openRoute() {
        return 'open';
      }
    }

    const adminDescriptor = Object.getOwnPropertyDescriptor(TestController.prototype, 'adminRoute');
    const openDescriptor = Object.getOwnPropertyDescriptor(TestController.prototype, 'openRoute');

    expect(Reflect.getMetadata(ROLES_KEY, adminDescriptor!.value)).toEqual(['admin']);
    expect(Reflect.getMetadata(ROLES_KEY, openDescriptor!.value)).toBeUndefined();
  });

  it('should support multiple required roles', () => {
    class TestController {
      @Roles('admin', 'webmaster')
      modRoute() {
        return 'mod';
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(TestController.prototype, 'modRoute');

    expect(Reflect.getMetadata(ROLES_KEY, descriptor!.value)).toEqual(['admin', 'webmaster']);
  });
});
