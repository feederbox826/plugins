
function main() {
  // monkeypatch window fetch to intercept graphQL requests
  const { fetch: originalFetch } = window
  if (window.fbox826) return
  // gqlListener.addEventListener('response', (e) => console.log(e.detail))

  const gqlListener = new EventTarget()

  const interceptors = []

  window.fbox826 = {
    gqlListener,
    interceptors
  }

  const preCheck = (response) =>
    response.headers.get("Content-Type") == "application/json" &&
    response.url.endsWith("/graphql")

  const responseInterceptor = async (response, request) => {
    // skip if not ok or not a graphql request
    if (!response.ok || !preCheck(response)) return response
    // get response data
    let data = await response.clone().json()
    // parse request data
    const query = request.body && JSON.parse(request.body)
    // run interceptors
    for (const interceptor of interceptors) data = await interceptor(data, query)
    // trigger response event
    gqlListener.dispatchEvent(new CustomEvent("response", { detail: data }))
    // return response
    return new Response(JSON.stringify(data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    })
  }

  window.fetch = async (...args) => {
    const [request, config] = args
    // request interceptor here
    const response = await originalFetch(request, config)
    // response interceptor
    try { return await responseInterceptor(response, config) }
    catch (e) { return response }
  }
}
main()