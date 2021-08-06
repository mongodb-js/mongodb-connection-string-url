import { URL, URLSearchParams } from 'whatwg-url';

const DUMMY_HOSTNAME = '__this_is_a_placeholder__';

// Adapted from the Node.js driver code:
// https://github.com/mongodb/node-mongodb-native/blob/350d14fde5b24480403313cfe5044f6e4b25f6c9/src/connection_string.ts#L146-L206
const HOSTS_REGEX = new RegExp(
  String.raw`(?<protocol>mongodb(?:\+srv|)):\/\/(?:(?<username>[^:]*)(?::(?<password>[^@]*))?@)?(?<hosts>(?!:)[^\/?@]+)(?<rest>.*)`
);

class CaseInsensitiveMap extends Map<string, string> {
  delete(name: any): boolean {
    return super.delete(this._normalizeKey(name));
  }

  get(name: any): string | null {
    return super.get(this._normalizeKey(name));
  }

  has(name: any): boolean {
    return super.has(this._normalizeKey(name));
  }

  set(name: any, value: any): this {
    return super.set(this._normalizeKey(name), value);
  }

  _normalizeKey(name: any): string {
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

const caseInsenstiveURLSearchParams = (Ctor: typeof URLSearchParams) =>
  class CaseInsenstiveURLSearchParams extends Ctor {
    append(name: any, value: any): void {
      return super.append(this._normalizeKey(name), value);
    }

    delete(name: any): void {
      return super.delete(this._normalizeKey(name));
    }

    get(name: any): string | null {
      return super.get(this._normalizeKey(name));
    }

    getAll(name: any): string[] {
      return super.getAll(this._normalizeKey(name));
    }

    has(name: any): boolean {
      return super.has(this._normalizeKey(name));
    }

    set(name: any, value: any): void {
      return super.set(this._normalizeKey(name), value);
    }

    _normalizeKey(name: any): string {
      return CaseInsensitiveMap.prototype._normalizeKey.call(this, name);
    }
  };

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

/**
 * Represents a mongodb:// or mongodb+srv:// connection string.
 * See: https://github.com/mongodb/specifications/blob/master/source/connection-string/connection-string-spec.rst#reference-implementation
 */
export default class ConnectionString extends URLWithoutHost {
  _hosts: string[];

  // eslint-disable-next-line complexity
  constructor(uri: string) {
    const match = uri.match(HOSTS_REGEX);
    if (!match) {
      throw new MongoParseError(`Invalid connection string "${uri}"`);
    }

    const { protocol, username, password, hosts, rest } = match.groups ?? {};

    if (!protocol || !hosts) {
      throw new MongoParseError(`Protocol and host list are required in "${uri}"`);
    }

    try {
      decodeURIComponent(username ?? '');
      decodeURIComponent(password ?? '');
    } catch (err) {
      throw new MongoParseError(err.message);
    }

    // characters not permitted in username nor password Set([':', '/', '?', '#', '[', ']', '@'])
    const illegalCharacters = new RegExp(String.raw`[:/?#\[\]@]`, 'gi');
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

    let authString = '';
    if (typeof username === 'string') authString += username;
    if (typeof password === 'string') authString += `:${password}`;
    if (authString) authString += '@';

    super(`${protocol.toLowerCase()}://${authString}${DUMMY_HOSTNAME}${rest}`);
    this._hosts = hosts.split(',');

    if (this.isSRV && this.hosts.length !== 1) {
      throw new MongoParseError('mongodb+srv URI cannot have multiple service names');
    }
    if (this.isSRV && this.hosts.some(host => host.includes(':'))) {
      throw new MongoParseError('mongodb+srv URI cannot have port number');
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
    return new ConnectionString(this.toString());
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
export class CommaAndColonSeparatedRecord extends CaseInsensitiveMap {
  constructor(from?: string | null) {
    super();
    for (const entry of (from ?? '').split(',')) {
      if (!entry) continue;
      const colonIndex = entry.indexOf(':');
      // Use .set() to properly account for case insensitivity
      if (colonIndex === -1) {
        this.set(entry, '');
      } else {
        this.set(entry.slice(0, colonIndex), entry.slice(colonIndex + 1));
      }
    }
  }

  toString(): string {
    return [...this].map(entry => entry.join(':')).join(',');
  }
}
