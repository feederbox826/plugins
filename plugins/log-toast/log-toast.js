async function toastLogs() {
  const baseURL = document.querySelector("base")?.getAttribute("href") ?? "/";
  const client = graphqlWs.createClient({ url: `${baseURL}graphql` });

  const intToast = (text) => {
    Toastify({
      text,
      duration: 2000,
      close: false,
      className: "toast-box toast-internal",
    }).showToast();
    console.log("[log-toast]", text);
  };

  // toast helpers
  const toast = (text, type) =>
    Toastify({
      text,
      duration: type == "debug" ? 5000 : 3000,
      close: true,
      stopOnFocus: true,
      className: `toast-box toast-${type}`,
      onClick: function () {
        navigator.clipboard.writeText(this.text);
        intToast("Copied to clipboard");
      },
    }).showToast();

  const subscription = client.iterate({ query: "subscription { loggingSubscribe { level message }}" });
  intToast("Subscribed to logs");
  for await (const event of subscription) {
    let debugLogs = [];
    for (const log of event.data.loggingSubscribe) {
      const level = log.level.toLowerCase()
      switch (level) {
        case 'trace': // if trace, ignore
          continue;
        case 'debug': // if debug, add to array
          debugLogs.push(log.message);
          break;
        default: // print other logs individually
          toast(log.message, level)
          break;
      }
    }
    // print debug logs together
    if (debugLogs.length) toast(debugLogs.join("\n"), "debug");
  }
  intToast("Subscription ended");
}
toastLogs();
