// public/js/script.js
document.querySelectorAll('.ripple').forEach(button => {
    button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ripple = document.createElement('span');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple-effect');
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});
router.get("/shop", IslogedIn, async function(req, res) {
    try {
        const sortby = req.query.sortby || 'popular';
        let sortOption = {};
        if (sortby === 'newest') {
            sortOption = { createdAt: -1 };
        }
        const products = await productModel.find().sort(sortOption);
        res.render("shop", { product: products });
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong");
        res.redirect("/");
    }
});

document.querySelectorAll('input[name="role"]').forEach(radio => {
    radio.addEventListener('change', () => {
        const form = document.getElementById('loginForm');
        form.action = radio.value === 'user' ? '/users/login' : '/owner/login';
        console.log('Form action set to:', form.action);
    });
});
document.querySelectorAll('.ripple').forEach(button => {
    button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ripple = document.createElement('span');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple-effect');
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});


document.getElementById('.cart').forEach(button => {
        button.addEventListener('click', function(e) {


        })
    })
    // public/js/script.js
document.querySelectorAll('.ripple').forEach(button => {
    button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ripple = document.createElement('span');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple-effect');
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});




const user = await userModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
const owner = await ownerModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });