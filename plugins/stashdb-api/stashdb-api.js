(async function () {
    // get apikey from Configuration
    const apikey_query = `query { configuration { general {
    stashBoxes {
        endpoint
        api_key
    }}}}`;
    const response = await csLib.callGQL({ query: apikey_query });
    const apikey = response.configuration.general.stashBoxes
      .find(stashbox => stashbox.endpoint === "https://stashdb.org/graphql").api_key

    const callGQL = (reqData) =>
      fetch(`https://stashdb.org/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ApiKey": apikey,
        },
        body: JSON.stringify(reqData),
      })
        .then((res) => res.json())
        .then((res) => res.data);

    // export to window
    window.stashdb = {  
      callGQL,
    };
  })();