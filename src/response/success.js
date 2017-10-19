/**
 * Created by Andrea on 10/17/2017.
 */

export default (req, res, callback = r => r, raw = false, contentType = () => 'application/json') => results => {
    res.setHeader('Content-Type', contentType(results));
    res.status(200);
    results = callback(results);
    !raw ? res.send({results}) : res.end(results, 'binary');
};
