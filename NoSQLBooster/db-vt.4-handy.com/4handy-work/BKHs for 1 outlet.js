const outletCode = "M1";
const startDate = "2020-11-09";

const text = ``;

const skus = text.match(/B\d{4}/g);

const buckets = _.chunk(skus, 20);

const user = db.users.findOne({ username: "na" });
const outlet = db.outlets.findOne({ code: outletCode });

_.forEach(buckets, (skus, index) => {
    const products = db.products.find({ sku: { $in: skus } }).toArray();
    const items = _.map(products, (product) => {
        return {
            status: "counting",
            product: product._id,
            sku: product.sku,
            description: product.description,
            counts: [],
        };
    });

    const date = moment(startDate).startOf("day").add(index, "day");
    const name = `${outlet.code} - Buổi kiểm hàng ngày ${moment(date).format("YYYY-MM-DD")}`;
    const staffs = db.users
        .find({
            roles: { $in: ["tro-ly", "qlc"] },
            outlet: outlet._id,
        })
        .map((d) => d._id);
    const startTime = moment(date).startOf("day").toDate();
    const endTime = moment(date).endOf("day").toDate();
    const status = "created";
    const mobileCount = true;
    const numberOfItems = items.length;
    const created = new Date();

    db.inventorycounts.insertMany([{
        name,
        outlet: outlet._id,
        shift: null,
        staffs,
        startTime,
        endTime,
        status,
        mobileCount,
        items,
        staffCanReset: true,
        numberOfItems,
        numberOfCountedItems: 0,
        numberOfPendingItems: 0,
        numberOfMatchedItems: 0,
        updateStock: true,
        created,
        user: user._id,
    }]\);
});

