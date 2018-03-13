/**
 * Created by Andrea on 10/17/2017.
 */

import collectionController from "./collection";

export default ({model, permission, thisName, otherName}) => collectionController({
    model,
    permission,
    filter: req => ({[thisName + "Id"]: req.params[thisName + "Id"]}),
    processResults: entities => ({
        results: entities.map(entity => ({
            id: entity[otherName + "Id"],
            version: entity[otherName + "Version"]
        }))
    })
});
