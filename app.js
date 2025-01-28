const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const searchRoutes = require('./routes/searchRoutes');
const adminRoutes = require('./routes/adminRoutes');
const blogRoutes = require('./routes/blogRoutes');
const homeRoutes = require('./routes/homeRoutes');
const { restrictTo } = require('./middlewares/roles');
const { checkAuth } = require('./middlewares/authenticate');

dotenv.config();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(checkAuth);
app.use('/admin', restrictTo('admin'), adminRoutes);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.use('/', homeRoutes);

app.use(contactRoutes);
app.use(authRoutes);
app.use(searchRoutes);
app.use(blogRoutes);


app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running on http://localhost:3000');
});
