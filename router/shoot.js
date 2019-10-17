const express = require('express');
// const iam = require('../util/whoAmI');

const router = express.Router();
router.get('/:who', (req, res) => {
    // const whois = req.params.who; // who's fired me?
    // console.log('AHHH... I GOT FIRED BY ' + whois);
    return res.send(''); // iam + " SAYS HE'LL GET BACK AT ME SOON"
});

module.exports = router;