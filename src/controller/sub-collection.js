/**
 * Created by Andrea on 10/17/2017.
 */

import collectionController from "./collection";

export default ({model, permission, thisName, otherName}) => collectionController({
    model,
    permission,
    filter: req => ({[thisName + "_id"]: req.params[thisName + "Id"]}),
    processResults: entities => entities.map(entity => ({
        id: entity[otherName + "_id"],
        version: entity[otherName + "_version"]
    }))
});
