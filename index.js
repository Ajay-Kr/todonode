const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const date = require(__dirname+'/date.js');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

const itemsArray = [];

// mongoose 
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB')
    .then(() => { "Connected to DB..." })
    .catch((err) => console.log(err));
  
  // const itemsSchema = {
  //   name: String,
  // };

  // const Item = mongoose.model("Item", itemsSchema);

  // const item1 = new Item({
  //   name: "New task"
  // });
  // const item2 = new Item({
  //   name: "Hit the + button to add new item."
  // });
  // const item3 = new Item({
  //   name: "<-- Hit this to delete an item"
  // });
  // const defaultItems = [item1, item2, item3];

  // Item.insertMany(defaultItems)
  //   .then(() => console.log("Successfully saved default items to DB."))
  //   .catch((err) => console.log(err));

  // Item.find()
  //   .then((foundItems) => {
  //     foundItems.forEach((item) => console.log(item))
  //   })
  //   .catch((err) => console.log(err));

  // mongoose.connection.close();
}

const itemsSchema = {
    name: String,
  };

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "New task"
  });
const item2 = new Item({
  name: "Hit the + button to add new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];

const listScheme = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model('List', listScheme);


app.get('/', (req, res) => {
  const day = date.getDate();
  
  Item.find()
    .then((foundItems) => {
      // foundItems.forEach((item) => console.log(item))
      if(foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => console.log("Successfully saved default items to DB."))
          .catch((err) => console.log(err));
      } 
      res.render('list', {listTitle: "Today", newListItem: foundItems});
    })
    .catch((err) => console.log(err));
});

app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today") {
    item.save()
      .then(() => console.log("Successfully added new item."))
      .catch((err) => console.log(err));
      res.redirect('/');
  } else {
    List.findOne({name: listName})
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/'+listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post('/delete', (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId) 
      .then((toRemove) => {
        toRemove; 
        console.log("Item deleted")
      })
      .catch((err) => console.log(err));
    
    res.redirect('/');
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
      .then(() => {
        res.redirect('/' + listName);
      })
      .catch((err) => {
        console.log(err);
      })
  }

  // Item.deleteOne({_id: checkedItemId})
  //   .then(() => console.log("Item deleted"))
  //   .catch((err) => console.log(err));

});

app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then((foundList) => {
      if(!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        console.log("Created the list");
        res.redirect("/"+customListName);
      }
      else {
        // show an existing list
        res.render('list', { listTitle: foundList.name, newListItem: foundList.items })
      }
    })
    .catch((err) => {
      console.log(err);
    });
})

// const items = ['Buy Food', 'Cook Food', 'Eat Food'];
// const workItems = [];

// app.get('/', (req, res) => {
//   let day = date.getDate();
//   res.render('list', {listTitle: day, newListItem: items});
// });

// app.post('/', (req, res) => {
//   let item = req.body.newItem;
//   if(req.body.list === 'Work') {
//     workItems.push(item);
//     res.redirect('/work');
//   } else {
//     items.push(item);
//     res.redirect('/');
//   }
// });

// app.get('/work', (req, res) => {
//   res.render('list', {listTitle: 'Work List', newListItem: workItems});
// });

// app.post('/work', (req, res) => {
//   let item = req.body.newItem;
//   workItems.push(item);

//   res.redirect('/work');
// });

// app.get('/about', (req, res) => {
//   res.render('about');
// });

app.listen('3000', () => {
  console.log('Server listning at port 3000...');
})