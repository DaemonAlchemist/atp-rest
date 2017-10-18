/**
 * Created by Andrea on 10/17/2017.
 */

export default (req, res, callback = r => r) => results => {
    res.status(200).send({results: callback(results)});
};
