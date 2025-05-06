// intercept with 0gql-intercept

function intercept() {
    const pluginTaskInterceptor = (data, query) => {
        if (query.operationName == "RunPluginTask") {
            const { plugin_id, task_name } = query.variables
            if (plugin_id == "useragent") {
                target = task_name.toLowerCase()
                if (target == "current") setUserAgent(window.navigator.userAgent)
                else getUserAgent(task_name.toLowerCase()).then(setUserAgent)
            }
        }
        return data
    }
    window.fbox826.interceptors.push(pluginTaskInterceptor)
}

const setUserAgent = (userAgent) => {
    console.log("Setting user agent to", userAgent)
    const query = `mutation ($userAgent: String!) {
        configureScraping(input: { scraperUserAgent: $userAgent })
        { scraperUserAgent }}`
    const variables = { userAgent }
    return fetch("/graphql", {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({ variables, query })
    })
}

// choose from current, ff or chrome
const getUserAgent = (choice) =>
    fetch("https://jnrbsn.github.io/user-agents/user-agents.json")
        .then(res => res.json())
        .then(userAgents => choice == "firefox" ? userAgents[9] : userAgents[3])

intercept()