
import create from './create';
import unlink from './unlink';
import subCollection from './sub-collection';

export default (entity1, permissions1, entity2, permissions2, model, modelBase) => {
    const idField1 = entity1 + "Id";
    const idField2 = entity2 + "Id";

    const validate = (v, req) => v
        .check(entity1)
            .required(req.params[idField1], entity1 + " id")
            .isInteger(req.params[idField1], entity1 + " id")
        .check(entity2)
            .required(req.body[idField2], entity2 + " id")
            .isInteger(req.body[idField2], entity2 + " id")
        .check("final").if([entity1, entity2]);

    return {
        get: subCollection({
            model,
            permission: permissions2.view,
            thisName: entity1,
            otherName: entity2
        }),
        post: create({
            model: modelBase,
            permission: permissions1.update,
            validate
        }),
        [':' + idField2]: {
            delete: unlink({
                model: modelBase,
                permission: permissions1.update,
                validate
            })
        }
    }
}
