function ok() {
    return {
        output: "ok"
    };
}

function main() {
    log.Debug("Running markergen plugin");
    var hookContext = input.Args.hookContext;
    var type = hookContext.type;

    if (!type) {
        // just return
        return ok();
    }
    var sceneID = hookContext.input.scene_id;
    genMarker(sceneID);
}

function genMarker(sceneID) {
    var query = "\
    mutation generate($sceneID: ID!) {\
        metadataGenerate(\
            input: {\
                sceneIDs: [$sceneID]\
                markers: true\
                markerImagePreviews: true\
                markerScreenshots: true\
            }\
        )\
    }\
    "
    var variables = {
        sceneID: sceneID
    };
    var result = gql.Do(query, variables);
    if(result.metadataGenerate) {
        return ok();
    } else {
        log.Error("Error generating marker for scene " + sceneID);
        return null;
    }
}
main();