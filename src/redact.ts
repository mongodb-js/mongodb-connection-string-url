import ConnectionString, { CommaAndColonSeparatedRecord } from './index';

export function redactValidConnectionString(inputUrl: Readonly<ConnectionString>): ConnectionString {
  const url = inputUrl.clone();
  if (url.username || url.password) {
    url.username = '_credentials_';
    url.password = '';
  }
  if (url.searchParams.has('authMechanismProperties')) {
    const props = new CommaAndColonSeparatedRecord(url.searchParams.get('authMechanismProperties'));
    if (props.get('AWS_SESSION_TOKEN')) {
      props.set('AWS_SESSION_TOKEN', '_credentials_');
      url.searchParams.set('authMechanismProperties', props.toString());
    }
  }
  if (url.searchParams.has('tlsCertificateKeyFilePassword')) {
    url.searchParams.set('tlsCertificateKeyFilePassword', '_credentials_');
  }
  if (url.searchParams.has('proxyUsername')) {
    url.searchParams.set('proxyUsername', '_credentials_');
  }
  if (url.searchParams.has('proxyPassword')) {
    url.searchParams.set('proxyPassword', '_credentials_');
  }
  return url;
}

export function redactConnectionString(uri: string): string {
  let parsed: ConnectionString | undefined;
  try {
    parsed = new ConnectionString(uri);
  } catch {}
  if (parsed) {
    // If we can parse the connection string, use the more precise
    // redaction logic.
    return parsed.redact().toString().replace(/_credentials_/g, '<credentials>');
  }

  const regexes = [
    // Username and password
    /(?<=\/\/)(.*)(?=@)/g,
    // AWS IAM Session Token as part of query parameter
    /(?<=AWS_SESSION_TOKEN(:|%3A))([^,&]+)/gi,
    // tlsCertificateKeyFilePassword query parameter
    /(?<=tlsCertificateKeyFilePassword=)([^&]+)/gi,
    // proxyUsername query parameter
    /(?<=proxyUsername=)([^&]+)/gi,
    // proxyPassword query parameter
    /(?<=proxyPassword=)([^&]+)/gi
  ];
  regexes.forEach(r => {
    uri = uri.replace(r, '<credentials>');
  });
  return uri;
}
