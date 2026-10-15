import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('Public', () => {
  it('should mark a handler as public via metadata', () => {
    class TestController {
      @Public()
      publicRoute() {
        return 'public';
      }

      privateRoute() {
        return 'private';
      }
    }

    const descriptor = Object.getOwnPropertyDescriptor(TestController.prototype, 'publicRoute');
    const privateDescriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      'privateRoute',
    );

    expect(Reflect.getMetadata(IS_PUBLIC_KEY, descriptor!.value)).toBe(true);
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, privateDescriptor!.value)).toBeUndefined();
  });
});
