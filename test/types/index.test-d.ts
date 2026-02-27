import { expectError, expectType } from 'tsd';

import ConnectionString from '../../src/index';

// typedSearchParams<{}>() should not allow any string key (current behavior: keyof {} is never)
const cs = new ConnectionString('mongodb://localhost');
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const paramsAny = cs.typedSearchParams<{}>();
expectError(paramsAny.get('foo'));
expectError(paramsAny.set('bar', 'baz'));
expectType<string | null>(paramsAny.get('foo' as never)); // an odd test but proves the return type isn't effected

// Test: typedSearchParams should restrict keys when using Record<...>
const paramsStrict = cs.typedSearchParams<Record<'foo' | 'bar', string>>();
// Should allow only 'foo' and 'bar' as keys
paramsStrict.get('foo');
paramsStrict.get('bar');
expectError(paramsStrict.get('baz'));

// Test: typedSearchParams should restrict keys when using an explicit union
const paramsUnion = cs.typedSearchParams<{ foo: string; bar: string }>();
paramsUnion.get('foo');
paramsUnion.get('bar');
expectError(paramsUnion.get('baz'));
