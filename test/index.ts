import { expect } from 'chai';
import ConnectionString, { CommaAndColonSeparatedRecord } from '../';

describe('ConnectionString', () => {
  context('with valid URIs', () => {
    for (const { uri, match } of [
      {
        uri: 'mongodb://localhost/',
        match: {
          href: 'mongodb://localhost/',
          protocol: 'mongodb:',
          username: '',
          password: '',
          pathname: '/',
          search: '',
          hash: '',
          isSRV: false,
          hosts: ['localhost']
        }
      },
      {
        uri: 'mongodb+srv://localhost',
        match: {
          href: 'mongodb+srv://localhost/',
          protocol: 'mongodb+srv:',
          username: '',
          password: '',
          pathname: '/',
          search: '',
          hash: '',
          isSRV: true,
          hosts: ['localhost']
        }
      },
      {
        uri: 'mongodb+srv://cat:meow@localhost/',
        match: {
          href: 'mongodb+srv://cat:meow@localhost/',
          protocol: 'mongodb+srv:',
          username: 'cat',
          password: 'meow',
          pathname: '/',
          search: '',
          hash: '',
          isSRV: true,
          hosts: ['localhost']
        }
      },
      {
        uri: 'mongodb://cat:meow@localhost:12345/db',
        match: {
          href: 'mongodb://cat:meow@localhost:12345/db',
          protocol: 'mongodb:',
          username: 'cat',
          password: 'meow',
          pathname: '/db',
          search: '',
          hash: '',
          isSRV: false,
          hosts: ['localhost:12345']
        }
      },
      {
        uri: 'mongodb://localhost:12345,anotherHost/?directConnection=true',
        match: {
          href: 'mongodb://localhost:12345,anotherHost/?directConnection=true',
          protocol: 'mongodb:',
          username: '',
          password: '',
          pathname: '/',
          search: '?directConnection=true',
          hash: '',
          isSRV: false,
          hosts: ['localhost:12345', 'anotherHost']
        }
      }
    ]) {
      it(`parses ${uri} correctly`, () => {
        const cs = new ConnectionString(uri);
        for (const key of Object.keys(match) as (keyof typeof cs & keyof typeof match)[]) {
          expect(cs[key]).to.deep.equal(match[key]);
        }
      });
    }
  });

  context('with invalid URIs', () => {
    for (const uri of [
      '',
      '//',
      '//@/',
      'mongodb://',
      'mongodb://@localhost/',
      'mongodb://:@localhost/',
      'mongodb://:pass@localhost/',
      'mongodb://%a@localhost/',
      'mongodb://:%a@localhost/',
      'mongodb://a[@localhost/',
      'mongodb://a:[@localhost/',
      'mongodb+srv://a,b,c/',
      'mongodb+srv://a:12345/',
      'mongodbabc://localhost',
      'totallynotamongodb://localhost'
    ]) {
      it(`parsing ${uri} throws an MongoParseError`, () => {
        try {
          // eslint-disable-next-line no-new
          new ConnectionString(uri);
        } catch (err) {
          expect((err as Error).name).to.equal('MongoParseError');
          return;
        }
        expect.fail('missed exception');
      });
    }
  });

  context('after modifications', () => {
    it('allows changing hosts', () => {
      const cs = new ConnectionString('mongodb://localhost');
      expect(cs.hosts).to.deep.equal(['localhost']);

      cs.hosts.push('localhost2');
      expect(cs.hosts).to.deep.equal(['localhost', 'localhost2']);
      expect(cs.toString()).to.equal('mongodb://localhost,localhost2/');

      cs.hosts = ['a', 'b', 'c'];
      expect(cs.hosts).to.deep.equal(['a', 'b', 'c']);
      expect(cs.toString()).to.equal('mongodb://a,b,c/');
    });

    it('performs case-insensitive matches on connection options', () => {
      const cs = new ConnectionString('mongodb://localhost/?SERVERSELECTIONTIMEOUTMS=100');
      cs.searchParams.set('serverSelectionTimeoutMS', '200');
      cs.searchParams.append('serverSelectionTimeoutMS', '300');

      expect(cs.toString()).to.equal('mongodb://localhost/?SERVERSELECTIONTIMEOUTMS=200&SERVERSELECTIONTIMEOUTMS=300');
      expect(cs.searchParams.has('serverSelectionTimeoutMS')).to.equal(true);
      expect(cs.searchParams.has('SERVERSELECTIONTIMEOUTMS')).to.equal(true);
      expect(cs.searchParams.get('serverSelectionTimeoutMS')).to.equal('200');
      expect(cs.searchParams.getAll('serverSelectionTimeoutMS')).to.deep.equal(['200', '300']);

      cs.searchParams.delete('serverSelectionTimeoutMS');
      expect(cs.searchParams.has('serverSelectionTimeoutMS')).to.equal(false);
      expect(cs.searchParams.has('SERVERSELECTIONTIMEOUTMS')).to.equal(false);
    });
  });

  context('cloning', () => {
    it('can make copies of ConnectionString instances', () => {
      const cs = new ConnectionString('mongodb://localhost');
      expect(cs.toString()).to.equal('mongodb://localhost/');
      expect(cs.clone().toString()).to.equal('mongodb://localhost/');
    });
  });

  context('URL methods that do not apply to connection strings as-is', () => {
    it('throws/returns dummy values', () => {
      const cs: any = new ConnectionString('mongodb://localhost');
      expect(cs.host).not.to.equal('localhost');
      expect(cs.hostname).not.to.equal('localhost');
      expect(cs.port).to.equal('');
      expect(cs.href).to.equal('mongodb://localhost/');
      expect(() => { cs.host = 'abc'; }).to.throw(Error);
      expect(() => { cs.hostname = 'abc'; }).to.throw(Error);
      expect(() => { cs.port = '1000'; }).to.throw(Error);
      expect(() => { cs.href = 'mongodb://localhost'; }).to.throw(Error);
    });
  });
});

describe('CommaAndColonSeparatedRecord', () => {
  it('creates an empty map for empty input', () => {
    expect(new CommaAndColonSeparatedRecord('').size).to.equal(0);
    expect(new CommaAndColonSeparatedRecord().size).to.equal(0);
    expect(new CommaAndColonSeparatedRecord(null).size).to.equal(0);
    expect(new CommaAndColonSeparatedRecord(undefined).size).to.equal(0);
  });

  it('returns an empty string for empty input', () => {
    expect(new CommaAndColonSeparatedRecord('').toString()).to.equal('');
    expect(new CommaAndColonSeparatedRecord().toString()).to.equal('');
    expect(new CommaAndColonSeparatedRecord(null).toString()).to.equal('');
    expect(new CommaAndColonSeparatedRecord(undefined).toString()).to.equal('');
  });

  it('allows getting entries', () => {
    const record = new CommaAndColonSeparatedRecord('A:B,C:D');
    expect(record.toString()).to.equal('A:B,C:D');
    expect(record.get('A')).to.equal('B');
    expect(record.get('C')).to.equal('D');
    expect(record.get('foo')).to.equal(undefined);
  });

  it('allows setting entries', () => {
    const record = new CommaAndColonSeparatedRecord('A:B,C:D');
    record.set('A', '0');
    record.set('E', '1');
    expect(record.toString()).to.equal('A:0,C:D,E:1');
  });

  it('accepts cases of multiple-colon entries', () => {
    const record = new CommaAndColonSeparatedRecord('A:B:C,D');
    expect(record.toString()).to.equal('A:B:C,D:');
    expect(record.get('A')).to.equal('B:C');
    expect(record.get('D')).to.equal('');
  });

  it('is case-insensitive', () => {
    const record = new CommaAndColonSeparatedRecord('foo:bar,FOO:BAR');
    expect(record.toString()).to.equal('foo:BAR');
    expect(record.get('FOO')).to.equal('BAR');
    expect(record.get('foo')).to.equal('BAR');
    record.set('FOO', 'baz');
    expect(record.toString()).to.equal('foo:baz');
  });
});
