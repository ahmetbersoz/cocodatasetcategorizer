const fs = require('fs');

const files = ['test_labels.json', 'train_labels.json', 'val_labels.json'];

const countCategories = function (annotations, categories) {
    categories.forEach(category => {
        category.count = 0;
    })

    categories.forEach(category => {
        annotations.forEach(annotation => {
            if (category.id === annotation.category_id) category.count++;
        });        
    });
}

let createdSummary = false;
let allSet;

files.forEach(filename => {
    console.log('---------', filename, '---------');
    let data = JSON.parse(fs.readFileSync(`./labels/${filename}`));

    if (!createdSummary) {
        allSet = JSON.parse(JSON.stringify(data.categories));
        allSet.forEach(category => {
            category.count = 0;
        });

        createdSummary = true;
    }

    countCategories(data.annotations, data.categories);

    data.categories.forEach(category => {
        allSet.forEach(allSetCategory => {
            if (category.id === allSetCategory.id) {
                allSetCategory.count += category.count;
            }
        });
    });

    console.log(data.categories);
});

console.log('---------', 'TOTAL:', '---------');
console.log(allSet);
