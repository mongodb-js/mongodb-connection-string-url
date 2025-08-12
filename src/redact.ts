import ConnectionString, { CommaAndColonSeparatedRecord } from "./index";

export interface ConnectionStringRedactionOptions {
  redactUsernames?: boolean;
  replacementString?: string;
}

export function redactValidConnectionString(
  inputUrl: Readonly<ConnectionString>,
  options?: ConnectionStringRedactionOptions,
): ConnectionString {
  const url = inputUrl.clone();
  const replacementString = options?.replacementString ?? "_credentials_";
  const redactUsernames = options?.redactUsernames ?? true;

  if ((url.username || url.password) && redactUsernames) {
    url.username = replacementString;
    url.password = "";
  } else if (url.password) {
    url.password = replacementString;
  }
  if (url.searchParams.has("authMechanismProperties")) {
    const props = new CommaAndColonSeparatedRecord(
      url.searchParams.get("authMechanismProperties"),
    );
    if (props.get("AWS_SESSION_TOKEN")) {
      props.set("AWS_SESSION_TOKEN", replacementString);
      url.searchParams.set("authMechanismProperties", props.toString());
    }
  }
  if (url.searchParams.has("tlsCertificateKeyFilePassword")) {
    url.searchParams.set("tlsCertificateKeyFilePassword", replacementString);
  }
  if (url.searchParams.has("proxyUsername") && redactUsernames) {
    url.searchParams.set("proxyUsername", replacementString);
  }
  if (url.searchParams.has("proxyPassword")) {
    url.searchParams.set("proxyPassword", replacementString);
  }
  return url;
}

export function redactConnectionString(
  uri: string,
  options?: ConnectionStringRedactionOptions,
): string {
  const replacementString = options?.replacementString ?? "<credentials>";
  const redactUsernames = options?.redactUsernames ?? true;

  let parsed: ConnectionString | undefined;
  try {
    parsed = new ConnectionString(uri);
  } catch {
    // squash errors
  }
  if (parsed) {
    // If we can parse the connection string, use the more precise
    // redaction logic.
    options = { ...options, replacementString: "___credentials___" };
    return parsed
      .redact(options)
      .toString()
      .replace(/___credentials___/g, replacementString);
  }

  // Note: The regexes here used to use lookbehind assertions, but we dropped that since
  // we need to support older browsers here.
  const R = replacementString; // alias for conciseness
  const replacements: ((uri: string) => string)[] = [
    // Username and password
    (uri) =>
      uri.replace(
        redactUsernames ? /(\/\/)(.*)(@)/g : /(\/\/[^@]*:)(.*)(@)/g,
        `$1${R}$3`,
      ),
    // AWS IAM Session Token as part of query parameter
    (uri) => uri.replace(/(AWS_SESSION_TOKEN(:|%3A))([^,&]+)/gi, `$1${R}`),
    // tlsCertificateKeyFilePassword query parameter
    (uri) => uri.replace(/(tlsCertificateKeyFilePassword=)([^&]+)/gi, `$1${R}`),
    // proxyUsername query parameter
    (uri) =>
      redactUsernames
        ? uri.replace(/(proxyUsername=)([^&]+)/gi, `$1${R}`)
        : uri,
    // proxyPassword query parameter
    (uri) => uri.replace(/(proxyPassword=)([^&]+)/gi, `$1${R}`),
  ];
  for (const replacer of replacements) {
    uri = replacer(uri);
  }
  return uri;
}
