import { URL, URLSearchParams } from 'whatwg-url';
import {
  redactValidConnectionString,
  redactConnectionString,
  ConnectionStringRedactionOptions
} from './redact';
export { redactConnectionString, ConnectionStringRedactionOptions };

const DUMMY_HOSTNAME = '__this_is_a_placeholder__';

function connectionStringHasValidScheme(connectionString: string) {
  return (
    connectionString.startsWith('mongodb://') ||
    connectionString.startsWith('mongodb+srv://')
  );
}

// Adapted from the Node.js driver code:
// https://github.com/mongodb/node-mongodb-native/blob/350d14fde5b24480403313cfe5044f6e4b25f6c9/src/connection_string.ts#L146-L206
const HOSTS_REGEX =
  /^(?<protocol>[^/]+):\/\/(?:(?<username>[^:]*)(?::(?<password>[^@]*))?@)?(?<hosts>(?!:)[^/?@]*)(?<rest>.*)/;

class CaseInsensitiveMap<K extends string = string> extends Map<K, string> {
  delete(name: K): boolean {
    return super.delete(this._normalizeKey(name));
  }

  get(name: K): string | undefined {
    return super.get(this._normalizeKey(name));
  }

  has(name: K): boolean {
    return super.has(this._normalizeKey(name));
  }

  set(name: K, value: any): this {
    return super.set(this._normalizeKey(name), value);
  }

  _normalizeKey(name: any): K {
    name = `${name}`;
    for (const key of this.keys()) {
      if (key.toLowerCase() === name.toLowerCase()) {
        name = key;
        break;
      }
    }
    return name;
  }
}

function caseInsenstiveURLSearchParams<K extends string = string>(Ctor: typeof URLSearchParams) {
  return class CaseInsenstiveURLSearchParams extends Ctor {
    append(name: K, value: any): void {
      return super.append(this._normalizeKey(name), value);
    }

    delete(name: K): void {
      return super.delete(this._normalizeKey(name));
    }

    get(name: K): string | null {
      return super.get(this._normalizeKey(name));
    }

    getAll(name: K): string[] {
      return super.getAll(this._normalizeKey(name));
    }

    has(name: K): boolean {
      return super.has(this._normalizeKey(name));
    }

    set(name: K, value: any): void {
      return super.set(this._normalizeKey(name), value);
    }

    keys(): IterableIterator<K> {
      return super.keys() as IterableIterator<K>;
    }

    values(): IterableIterator<string> {
      return super.values();
    }

    entries(): IterableIterator<[K, string]> {
      return super.entries() as IterableIterator<[K, string]>;
    }

    [Symbol.iterator](): IterableIterator<[K, string]> {
      return super[Symbol.iterator]() as IterableIterator<[K, string]>;
    }

    _normalizeKey(name: K): string {
      return CaseInsensitiveMap.prototype._normalizeKey.call(this, name);
    }
  };
}

// Abstract middle class to appease TypeScript, see https://github.com/microsoft/TypeScript/pull/37894
abstract class URLWithoutHost extends URL {
  abstract get host(): never;
  abstract set host(value: never);
  abstract get hostname(): never;
  abstract set hostname(value: never);
  abstract get port(): never;
  abstract set port(value: never);
  abstract get href(): string;
  abstract set href(value: string);
}

class MongoParseError extends Error {
  get name(): string {
    return 'MongoParseError';
  }
}

export interface ConnectionStringParsingOptions {
  looseValidation?: boolean;
}

/**
 * Represents a mongodb:// or mongodb+srv:// connection string.
 * See: https://github.com/mongodb/specifications/blob/master/source/connection-string/connection-string-spec.rst#reference-implementation
 */
export class ConnectionString extends URLWithoutHost {
  _hosts: string[];

  // eslint-disable-next-line complexity
  constructor(uri: string, options: ConnectionStringParsingOptions = {}) {
    const { looseValidation } = options;
    if (!looseValidation && !connectionStringHasValidScheme(uri)) {
      throw new MongoParseError('Invalid scheme, expected connection string to start with "mongodb://" or "mongodb+srv://"');
    }

    const match = uri.match(HOSTS_REGEX);
    if (!match) {
      throw new MongoParseError(`Invalid connection string "${uri}"`);
    }

    const { protocol, username, password, hosts, rest } = match.groups ?? {};

    if (!looseValidation) {
      if (!protocol || !hosts) {
        throw new MongoParseError(`Protocol and host list are required in "${uri}"`);
      }

      try {
        decodeURIComponent(username ?? '');
        decodeURIComponent(password ?? '');
      } catch (err) {
        throw new MongoParseError((err as Error).message);
      }

      // characters not permitted in username nor password Set([':', '/', '?', '#', '[', ']', '@'])
      const illegalCharacters = /[:/?#[\]@]/gi;
      if (username?.match(illegalCharacters)) {
        throw new MongoParseError(`Username contains unescaped characters ${username}`);
      }
      if (!username || !password) {
        const uriWithoutProtocol = uri.replace(`${protocol}://`, '');
        if (uriWithoutProtocol.startsWith('@') || uriWithoutProtocol.startsWith(':')) {
          throw new MongoParseError('URI contained empty userinfo section');
        }
      }

      if (password?.match(illegalCharacters)) {
        throw new MongoParseError('Password contains unescaped characters');
      }
    }

    let authString = '';
    if (typeof username === 'string') authString += username;
    if (typeof password === 'string') authString += `:${password}`;
    if (authString) authString += '@';

    super(`${protocol.toLowerCase()}://${authString}${DUMMY_HOSTNAME}${rest}`);
    this._hosts = hosts.split(',');

    if (!looseValidation) {
      if (this.isSRV && this.hosts.length !== 1) {
        throw new MongoParseError('mongodb+srv URI cannot have multiple service names');
      }
      if (this.isSRV && this.hosts.some(host => host.includes(':'))) {
        throw new MongoParseError('mongodb+srv URI cannot have port number');
      }
    }

    if (!this.pathname) {
      this.pathname = '/';
    }
    Object.setPrototypeOf(this.searchParams, caseInsenstiveURLSearchParams(this.searchParams.constructor as any).prototype);
  }

  // The getters here should throw, but that would break .toString() because of
  // https://github.com/nodejs/node/issues/36887. Using 'never' as the type
  // should be enough to stop anybody from using them in TypeScript, though.
  get host(): never { return DUMMY_HOSTNAME as never; }
  set host(_ignored: never) { throw new Error('No single host for connection string'); }
  get hostname(): never { return DUMMY_HOSTNAME as never; }
  set hostname(_ignored: never) { throw new Error('No single host for connection string'); }
  get port(): never { return '' as never; }
  set port(_ignored: never) { throw new Error('No single host for connection string'); }
  get href(): string { return this.toString(); }
  set href(_ignored: string) { throw new Error('Cannot set href for connection strings'); }

  get isSRV(): boolean {
    return this.protocol.includes('srv');
  }

  get hosts(): string[] {
    return this._hosts;
  }

  set hosts(list: string[]) {
    this._hosts = list;
  }

  toString(): string {
    return super.toString().replace(DUMMY_HOSTNAME, this.hosts.join(','));
  }

  clone(): ConnectionString {
    return new ConnectionString(this.toString(), {
      looseValidation: true
    });
  }

  redact(options?: ConnectionStringRedactionOptions): ConnectionString {
    return redactValidConnectionString(this, options);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/ban-types
  typedSearchParams<T extends {}>() {
    const sametype = (false as true) && new (caseInsenstiveURLSearchParams<keyof T & string>(URLSearchParams))();
    return this.searchParams as unknown as typeof sametype;
  }

  [Symbol.for('nodejs.util.inspect.custom')](): any {
    const { href, origin, protocol, username, password, hosts, pathname, search, searchParams, hash } = this;
    return { href, origin, protocol, username, password, hosts, pathname, search, searchParams, hash };
  }
}

/**
 * Parses and serializes the format of the authMechanismProperties or
 * readPreferenceTags connection string parameters.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export class CommaAndColonSeparatedRecord<K extends {} = Record<string, unknown>> extends CaseInsensitiveMap<keyof K & string> {
  constructor(from?: string | null) {
    super();
    for (const entry of (from ?? '').split(',')) {
      if (!entry) continue;
      const colonIndex = entry.indexOf(':');
      // Use .set() to properly account for case insensitivity
      if (colonIndex === -1) {
        this.set(entry as (keyof K & string), '');
      } else {
        this.set(entry.slice(0, colonIndex) as (keyof K & string), entry.slice(colonIndex + 1));
      }
    }
  }

  toString(): string {
    return [...this].map(entry => entry.join(':')).join(',');
  }
}

export default ConnectionString;
