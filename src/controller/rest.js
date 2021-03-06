/**
 * Created by Andrea on 10/17/2017.
 */

import Success from "../response/success";
import Error from "../response/error";
import InternalServerError from "../response/internal-server-error";

export default ({
    getValidator,
    loadResource,
    processResults = results => ({results}),
    raw = false,
    contentType = () => 'application/json'
}) => (req, res) => {
    try {
        getValidator(req).then(
            () => {
                try {
                    loadResource(req)
                        .then(Success(req, res, processResults, raw, contentType))
                        .catch(Error(req, res));
                } catch (e) {
                    console.log(e);
                    InternalServerError(req, res)(e.toString());
                }
            },
            Error(req, res)
        )
    } catch(e) {
        console.log(e);
        InternalServerError(req, res)(e.toString());
    }
};
