/**
 * Created by Andrea on 10/20/2017.
 */

import collection from "./collection";
import create from "./create";
import view from "./view";
import update from "./update";
import replace from "./replace";
import deleteController from "./delete";

export default ({model, permissions, idField}) => {
    const restParams = permission => ({
        model,
        permission,
        idField,
        validate: (v, req) => v.isInteger(req.params[idField], idField) //TODO:  Add existence validation
    });

    const updateParams = permission => ({
        model,
        permission,
        idField,
        validate: v => v, //TODO:  Implement hook for edit validations
    });

    return {
        get: collection({
            model,
            permission: permissions.view,
        }),
        post: create({
            model,
            permission: permissions.create,
            validate: v => v, //TODO:  Implement hook for creation validations
        }),
        [':' + idField]: {
            get: view(restParams(permissions.view)),
            put: replace(updateParams(permissions.update)),
            patch: update(updateParams(permissions.update)),
            delete: deleteController(restParams(permissions.delete))
        }
    };
}