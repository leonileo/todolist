//jshint esversion:6
const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')
const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://HMS-db:dbkal4617@ms-db.qkx6p6u.mongodb.net/todolistDB?retryWrites=true&w=majority', {useNewUrlParser: true});

const app = express()
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))


const itemsSchema = new mongoose.Schema({
    itemName : String

})

const Item = mongoose.model('Item', itemsSchema)

const Getup = new Item({
    itemName: 'Getup'
})

const drinkWater = new Item({
    itemName: 'drink water'
})

const workout = new Item({
    itemName: 'workout'
})

const defaultItems = [Getup, drinkWater, workout]

const listSchema = new mongoose.Schema({
    name: String,
    item: [itemsSchema]
})

const List = mongoose.model('List', listSchema);


// get route for home

app.get('/', (req,res) =>{
    const itemsArray = []
    const findItems = async (err, msg) => {
        const items = Item.find({}).exec()
        const p = await items
        p.forEach((val)=>{
            itemsArray.push(val)
        })
        
        if (itemsArray.length === 0) {
            const addItems = async (err) =>{
                const inserted = Item.insertMany(defaultItems)
                const p = await inserted
                if(err){
                    console.log(err);
                } else {
                    console.log("Success");
                }
            }
            addItems()
            res.redirect('/')
        } 
        else {
            res.render('list', {listTitle : 'Today', newListItem: itemsArray})
        }
    }
    findItems()
})

// post route for home
app.post('/', (req,res) =>{
    const itemName = req.body.newItem 
    const listName = req.body.list

    const newItem = new Item({
    itemName: itemName
    })

    if (listName === 'Today'){
        newItem.save()
        res.redirect('/')
    } else {
        List.findOne({name: listName}).then(foundList => {
            foundList.item.push(newItem)
            foundList.save()
            res.redirect(`/${listName}`)
        })
    }
})

app.post("/delete", (req,res) => {
    checked = req.body.checked
    listName = req.body.listName

    if ( listName === 'Today'){
        const deleteItem = async (err) => {
            const deleted = Item.deleteOne({itemName: checked})
            await deleted
            if (err){
                console.log(err);
            } else{
                console.log(`Deleted ${checked}`);
                res.redirect('/')
            }
        }
        deleteItem()
    } else {
        List.findOneAndDelete({name: listName}, {$pull: {items: {_id: checked} } }).then( response => {
            res.redirect(`/${listName}`)
        })
    }

})

// get route for custom routes

app.get('/:customParam', (req,res) => {
    const customParam = _.capitalize(req.params.customParam);
    
    List.findOne({name: customParam}).exec().then((result) => {
        if (!result){
                const list = new List ({
                    name: customParam,
                    item: defaultItems
                })  
                list.save()
                res.redirect(`/${customParam}`)
            } else{
                res.render('list', {listTitle : result.name, newListItem: result.item})
        }
    })

})


// post route for work
app.post('/work', (req,res) => {
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect('/work')
})

// get route for about
app.get('/about', (req,res) =>{
    res.render('about')
})



app.listen( process.env.PORT || 3000, ()=>{
    console.log('Server started on port 3000');
})