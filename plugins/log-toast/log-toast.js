async function toastLogs() {
  const baseURL = document.querySelector("base")?.getAttribute("href") ?? "/";
  const client = graphqlWs.createClient({ url: `${baseURL}graphql` });

  const intToast = (text) => {
    Toastify({
      text,
      duration: 2000,
      close: false,
      className: "toast-box toast-internal",
      offset: {
        y: '3rem'
      }
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
      offset: {
        y: '3rem'
      },
      onClick: function () {
        navigator.clipboard.writeText(this.text);
        intToast("Copied to clipboard");
      },
    }).showToast();

  const subscription = client.iterate({ query: "subscription { loggingSubscribe { level message }}" });
  intToast("Subscribed to logs");
  for await (const event of subscription) {
    // aggregate logs together
    const aggLogs = {
      "debug": [],
      "info": [],
      "warning": [],
      "error": []
    }
    for (const log of event.data.loggingSubscribe) {
      const level = log.level.toLowerCase()
      if (level == "trace") continue
      // aggregate and print logs together
      aggLogs[level].push(log.message)
    }
    for (const level of Object.keys(aggLogs)) {
      const logs = aggLogs[level]
      if (!logs.length) continue
      toast(logs.join("\n"), level)
    }
  }
  intToast("Subscription ended");
}
toastLogs();
