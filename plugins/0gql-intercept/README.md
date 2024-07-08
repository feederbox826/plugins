# GQL Request interceptor and request processor

Adds an event sink for new GraphQL responses (readonly)

```js
// requests
window.fbox826.addEventListener("response" => e => console.log)
// response
{
    "configuration": {
        "general": {
        ...
        },
        "defaults": {
        ...
        "__typename": "ConfigDefaultSettingsResult"
        },
        "plugins": {
        ...
        },
        "__typename": "ConfigResult"
    }
}
```
request interceptor
```js
const interceptor = (data, query) => {
    if (!data.data.findScenes) return data
    // replace all scene details with `Lorem Ipsum`
    newScenes = data.data.findScenes.scenes.forEach(scene => {
        scene.details = "Lorem Ipsum"
    })
    data.data.findScenes.scenes = newScenes
    return data
}
window.fbox826.interceptors.push(interceptor)
```
