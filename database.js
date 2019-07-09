const Knex = require('knex')
const knex = Knex({
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING,
});


exports.getFieldNames = (user_id) => {
    return knex('attributes').distinct('name').where({user_id }).select('name')
}

exports.getAttributes = (user_id) => {
    return knex('attributes').where({ user_id }).select(['name','raw','last_seen','type'])
}

exports.addProfile = ( user_id, policy_uri, receipt_id) => {
    let profile = {
        policy_uri,
        receipt_id,
        user_id
    }
    
    return knex('profiles').insert(profile)
}

exports.addAttribute = (user_id, attribute) => {
    let { value: raw, name } = attribute

    let data = {
        raw,
        name,
        user_id
    }

    switch(name) {
        case 'selfie':
            data.type = 'IMAGE';
            break;
        case 'dateOfBirth':
            data.type = 'DATE';
            data.date = raw;
            break;
        default:
            data.type = 'TEXT';
            data.text = raw;
            break;
    }

    return knex('attributes').count('').where({
        user_id,
        raw,
        name
    }).then( (result) => {
        const [count] = result

        if(parseInt(count['count(*)'], 10) === 0) {
            return knex('attributes').insert(data)
        } else {
            return knex('attributes').where({
                user_id,
                raw,
                name
            }).update({
                last_seen: new Date()
            })
        }
    })
}

exports.knex = knex