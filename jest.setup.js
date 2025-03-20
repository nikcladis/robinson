// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Mock Request and Response for Next.js
global.Request = class Request {
  constructor(input, init) {
    this.url = input || 'https://localhost:3000';
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers || {});
    this.body = init?.body || null;
  }
  
  async json() {
    return this.body ? JSON.parse(this.body) : {};
  }
  
  async text() {
    return this.body ? this.body.toString() : '';
  }
};

global.Response = class Response {
  constructor(body, init) {
    this.body = body;
    this.status = init?.status || 200;
    this.statusText = init?.statusText || 'OK';
    this.headers = new Headers(init?.headers || {});
    this.ok = this.status >= 200 && this.status < 300;
  }
  
  async json() {
    return this.body ? JSON.parse(this.body) : {};
  }
  
  async text() {
    return this.body ? this.body.toString() : '';
  }
};

global.Headers = class Headers {
  constructor(init) {
    this._headers = {};
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value);
      });
    }
  }
  
  set(name, value) {
    this._headers[name.toLowerCase()] = value;
  }
  
  get(name) {
    return this._headers[name.toLowerCase()];
  }
};

// Mock NextResponse
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: jest.fn((data, options) => ({
        data,
        options,
      })),
      redirect: jest.fn((url) => ({ url })),
      next: jest.fn(() => ({})),
    },
  };
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    forEach: jest.fn(),
    entries: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    toString: jest.fn(),
  }),
}));

// Mock next-auth
jest.mock('next-auth/react', () => {
  return {
    __esModule: true,
    useSession: jest.fn(() => {
      return {
        data: {
          user: { 
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com',
            role: 'USER',
          }
        },
        status: 'authenticated',
      };
    }),
    signIn: jest.fn(),
    signOut: jest.fn(),
  };
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    statusText: 'OK',
  })
);

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
}); 