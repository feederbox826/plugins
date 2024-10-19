async function consoleLogs() {
  const baseURL = document.querySelector("base")?.getAttribute("href") ?? "/";
  const client = graphqlWs.createClient({ url: `${baseURL}graphql` });
  const subscription = client.iterate({ query: "subscription { loggingSubscribe { level message }}" });

  console.log("[stash-log] subscribed to logs");
  for await (const event of subscription) {
    for (const log of event.data.loggingSubscribe) {
      let level = log.level.toLowerCase()
      if (level === "trace") continue // ignore trace
      if (level === "warning") level = "warn" // rewrite warning to warn
      // print to console
      console[level](`[stash-log][${level}] ${log.message}`)
    }
  }
  console.log("[stash-log] subscription ended");
}
consoleLogs();
