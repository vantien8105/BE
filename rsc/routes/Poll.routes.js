const bodyParser = require('body-parser');
const express = require('express');
const app = express.Router();
const db = require ('../config/connect_DB');

app.use(bodyParser.json());

const getID = async(res, mail)=>{
    const [user_ID] = await db.query('SELECT id_user FROM user WHERE email = ?', [mail]);
    if(!user_ID[0]){
        return res.status(404).send({message:'Your email is not exist'})
    }
    return user_ID[0].id_user;
}

//tao poll va options
app.post('/createPoll/', async(req,res) =>{
    try{
    const title = req.body.title;
    if(!title){
        return res.status(400).send({error: 'title is empty'});
    }
    const user_create = req.body.email;
    const options = req.body.options;
    console.log(options);
    const date = new Date();
    const user_ID = await getID(res, user_create);
    const [titleCheck] = await db.query('SELECT COUNT(*) AS count FROM poll WHERE title = ?', [title]);
    if (titleCheck[0].count > 0) {
        return res.status(400).json({ message: 'Title already exists' });
    }

    await db.query ('INSERT INTO poll (title, user_ID, status) value (? , ? , ?)', [title, user_ID, date]);
    const [poll] = await db.query('SELECT poll_id FROM poll WHERE user_ID = ? AND title = ?', [user_ID, title]);
    console.log(poll);
    const poll_ID= poll[0].poll_id;
    const optionPromises = options.map(option =>
        db.query('INSERT INTO opion (content, poll_ID, user_ID) VALUES (?, ?, ?)', [option, poll_ID, user_ID])
    );
    await Promise.all(optionPromises);
    res.send({message:'Poll created'});
    }
    catch(error){
        res.status(500).json({ error: error.message });
        console.log(error);
    }
});

//them option cho poll
app.post('/createOption/:id', async(req, res) =>{
   try{
    const user = req.body.email;
    const poll_ID = req.params.id;
    const option = req.body.option;
    const user_ID = await getID(res, user);
    if(!option){
        return res.status(400).send({error: 'option is empty'});
    }
    await db.query('INSERT INTO opion (content, poll_ID, user_ID ) value(? , ? , ?)', [option, poll_ID, user_ID]);
    res.send({message:'Option created'});
   }
    catch(error){
        res.status(500).json({ error: error.message });
        console.log(error);
    }
});


//vote
app.post('/vote/:id', async (req, res) =>{
    try{
        const user = req.body.email;
    const option_ID = req.body.option_ID;
    const poll_ID = req.params.id;
    const user_ID =await getID(res, user);
    await db.query('INSERT INTO user_opion (user_ID, poll_ID, option_ID) value (? , ?, ?)', [user_ID, poll_ID, option_ID]);
    res.send({message:'Your vote recorded'});
    }
    catch(error){
        res.status(500).json({ error: error.message });
        console.log(error);
    }
})

//xem cac option cua mot poll bang id
app.get('/getOption/:id', async (req, res) =>{
   try{ 
    const poll_ID = req.params.id;

    // Lấy thông tin của poll
    const [pollInfo] = await db.query(`
        SELECT 
            poll_ID, title, user_ID, status
        FROM 
            poll
        WHERE 
            poll_ID = ?
    `, [poll_ID]);

    if (pollInfo.length === 0) {
        return res.status(404).json({ message: 'Poll not found' });
    }

    // Lấy số lượng vote cho các option và thông tin người bình chọn
    const [voteCounts] = await db.query(`
        SELECT 
            o.option_ID, o.content, u.email, COUNT(uo.user_ID) AS vote_count
        FROM 
            opion o
        LEFT JOIN 
            user_opion uo ON o.option_ID = uo.option_ID
        LEFT JOIN
            user u ON uo.user_ID = u.id_user
        WHERE 
            o.poll_ID = ?
        GROUP BY 
            o.option_ID, o.content, u.email
    `, [poll_ID]);
        console.log(voteCounts);
        
    // Sắp xếp lại kết quả theo option_ID và gom nhóm người dùng đã bình chọn
    const options = voteCounts.reduce((acc, curr) => {
        const option = acc.find(o => o.option_ID === curr.option_ID);
        if (option) {
            option.users.push(curr.email);
            option.vote_count = curr.vote_count; // Cập nhật vote_count nếu cần thiết
        } else {
            acc.push({
                option_ID: curr.option_ID,
                content: curr.content,
                vote_count: curr.vote_count,
                users: curr.email ? [curr.email] : []
            });
        }
        return acc;
    }, []);

    res.status(200).json({
        poll: pollInfo[0],
        voteCounts
    });}
    catch(error){
        res.status(500).json({ error: error.message });
        console.log(error);
    }
});

app.delete('/DeletePoll/:poll_id', async (req, res) =>{
    try{
        const poll_ID = req.params.poll_id;
        // Xóa các vote liên quan đến các option trong poll
        await connection.query(`
            DELETE FROM user_opion uo
            WHERE uo.poll_ID = ?
        `, [poll_ID]);

        // Xóa các option liên quan đến poll
        await connection.query(`
            DELETE FROM opion
            WHERE poll_ID = ?
        `, [poll_ID]);

        // Xóa poll
        await connection.query(`
            DELETE FROM poll
            WHERE poll_ID = ?
        `, [poll_ID]);
    }
    catch (error){
        res.status(500).json({ error: error.message });
        console.log(error);
    }
})
module.exports = app;