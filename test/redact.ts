import { expect } from 'chai';
import { redactConnectionString } from '../';

describe('redact credentials', () => {
  for (const protocol of ['mongodb', 'mongodb+srv', '+invalid+']) {
    context(`when url contains credentials (protocol: ${protocol})`, () => {
      it('returns the <credentials> in output instead of password', () => {
        expect(redactConnectionString(`${protocol}://admin:catsc@tscat3ca1s@cats-data-sets-e08dy.mongodb.net/admin`))
          .to.equal(`${protocol}://<credentials>@cats-data-sets-e08dy.mongodb.net/admin`);
      });

      it('returns the <credentials> keeping the username if desired', () => {
        expect(redactConnectionString(`${protocol}://admin:catsc@tscat3ca1s@cats-data-sets-e08dy.mongodb.net/admin`, { redactUsernames: false }))
          .to.equal(`${protocol}://admin:<credentials>@cats-data-sets-e08dy.mongodb.net/admin`);
      });

      it('returns the <credentials> in output instead of IAM session token', () => {
        expect(redactConnectionString(`${protocol}://cats-data-sets-e08dy.mongodb.net/admin?authMechanism=MONGODB-AWS&authMechanismProperties=AWS_SESSION_TOKEN%3Asampletoken,else%3Amiau&param=true`).replace(/%2C/g, ','))
          .to.equal(`${protocol}://cats-data-sets-e08dy.mongodb.net/admin?authMechanism=MONGODB-AWS&authMechanismProperties=AWS_SESSION_TOKEN%3A<credentials>,else%3Amiau&param=true`);
        expect(redactConnectionString(`${protocol}://cats-data-sets-e08dy.mongodb.net/admin?authMechanism=MONGODB-AWS&authMechanismProperties=AWS_SESSION_TOKEN%3Asampletoken&param=true`))
          .to.equal(`${protocol}://cats-data-sets-e08dy.mongodb.net/admin?authMechanism=MONGODB-AWS&authMechanismProperties=AWS_SESSION_TOKEN%3A<credentials>&param=true`);
        expect(redactConnectionString(`${protocol}://cats-data-sets-e08dy.mongodb.net/admin?authMechanism=MONGODB-AWS&authMechanismProperties=AWS_SESSION_TOKEN%3Asampletoken`))
          .to.equal(`${protocol}://cats-data-sets-e08dy.mongodb.net/admin?authMechanism=MONGODB-AWS&authMechanismProperties=AWS_SESSION_TOKEN%3A<credentials>`);
      });

      it('returns the <credentials> in output instead of password and IAM session token', () => {
        expect(redactConnectionString(`${protocol}://admin:tscat3ca1s@cats-data-sets-e08dy.mongodb.net/admin?authMechanism=MONGODB-AWS&authMechanismProperties=AWS_SESSION_TOKEN%3Asampletoken&param=true`))
          .to.equal(`${protocol}://<credentials>@cats-data-sets-e08dy.mongodb.net/admin?authMechanism=MONGODB-AWS&authMechanismProperties=AWS_SESSION_TOKEN%3A<credentials>&param=true`);
      });

      it('returns the <credentials> in output instead of tlsCertificateKeyFilePassword', () => {
        expect(redactConnectionString(`${protocol}://admin:tscat3ca1s@cats-data-sets-e08dy.mongodb.net/admin?tls=true&tlsCertificateKeyFilePassword=p4ssw0rd`))
          .to.equal(`${protocol}://<credentials>@cats-data-sets-e08dy.mongodb.net/admin?tls=true&tlsCertificateKeyFilePassword=<credentials>`);
      });

      it('returns the <credentials> in output instead of proxyPassword and proxyUsername', () => {
        expect(redactConnectionString(`${protocol}://admin:tscat3ca1s@cats-data-sets-e08dy.mongodb.net/admin?proxyUsername=foo&proxyPassword=bar&param=true`))
          .to.equal(`${protocol}://<credentials>@cats-data-sets-e08dy.mongodb.net/admin?proxyUsername=<credentials>&proxyPassword=<credentials>&param=true`);
        expect(redactConnectionString(`${protocol}://admin:tscat3ca1s@cats-data-sets-e08dy.mongodb.net/admin?proxyUsername=foo&proxyPassword=bar`))
          .to.equal(`${protocol}://<credentials>@cats-data-sets-e08dy.mongodb.net/admin?proxyUsername=<credentials>&proxyPassword=<credentials>`);
        expect(redactConnectionString(`${protocol}://admin:tscat3ca1s@cats-data-sets-e08dy.mongodb.net/admin?proxyUsername=foo&proxyPassword=bar`, { redactUsernames: false }))
          .to.equal(`${protocol}://admin:<credentials>@cats-data-sets-e08dy.mongodb.net/admin?proxyUsername=foo&proxyPassword=<credentials>`);
        expect(redactConnectionString(`${protocol}://admin:tscat3ca1s@cats-data-sets-e08dy.mongodb.net/admin?proxyUsername=foo&proxyPassword=bar`, { replacementString: '****' }))
          .to.equal(`${protocol}://****@cats-data-sets-e08dy.mongodb.net/admin?proxyUsername=****&proxyPassword=****`);
      });
    });

    context('when url contains no credentials', () => {
      it('does not alter input', () => {
        expect(redactConnectionString(`${protocol}://127.0.0.1:27017/`))
          .to.equal(`${protocol}://127.0.0.1:27017/`);
        expect(redactConnectionString(`${protocol}://127.0.0.1:27017/?authMechanismProperties=IGNORE:ME`))
          .to.equal(`${protocol}://127.0.0.1:27017/?authMechanismProperties=IGNORE:ME`);
      });
    });
  }
});
