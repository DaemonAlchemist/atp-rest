
import validator from 'atp-validator';

export default (permissions, idField, controller) => (req, res) => {
    validator()
        .loggedIn(req)
        .hasPermission(permissions.view, req)
        .isInteger(req.params[idField], idField)
        .then(() => {
            req.query[idField] = req.params[idField];
            req.query.columns="id,version";
            controller.get(req, res);
        });
};