const fs = require('fs');
const path = require('path');

const labelsPath = './labels.json';

let input = JSON.parse(fs.readFileSync(labelsPath));

const output = {
    train: {
        images: [],
        annotations: [],
        categories: input.categories        
    },
    val: {
        images: [],
        annotations: [],
        categories: input.categories        
    },
    test: {
        images: [],
        annotations: [],
        categories: input.categories        
    }
}

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

input.images.forEach(image => {
    image.hasCategories = [];

    input.annotations.forEach(annotation => {
        if (image.id === annotation.image_id) {
            image.hasCategories.push(annotation.category_id);
        }
    });
});

countCategories(input.annotations, input.categories);
input.categories.sort((a, b) => (a.count > b.count) ? 1 : -1)
console.log('initialState:', input.categories);

input.categories.forEach(category => {
    console.log('category:', category.name, category.id);

    const trainCount = Math.floor(category.count * 0.6);
    const testCount = Math.floor(category.count * 0.2);

    let consumed = 0;
    let willBeRemovedImages = [];
    let willBeRemovedAnnotations = [];

    input.images.forEach((image) => {
        if (image.hasCategories.includes(category.id)) {
            consumed+= image.hasCategories.filter(c => c === category.id).length;

            let type = 'train';

            if (consumed > trainCount && consumed <= trainCount + testCount) type = 'test';
            if (consumed > trainCount + testCount) type = 'val';
            
            willBeRemovedImages.push(image.id);
            delete image.hasCategories;
            output[type].images.push(image);
            
            input.annotations.forEach((annotation) => {
                if (annotation.image_id === image.id) {
                    willBeRemovedAnnotations.push(annotation.id);
                    output[type].annotations.push(annotation);
                }
            });
        }
    });

    input.images = input.images.filter(i => !willBeRemovedImages.includes(i.id));
    input.annotations = input.annotations.filter(a => !willBeRemovedAnnotations.includes(a.id));

    willBeRemovedImages.length = 0;
    willBeRemovedAnnotations.length = 0;

    countCategories(input.annotations, input.categories);
    console.log(input.categories);
});

input.categories.sort((a, b) => (a.id > b.id) ? 1 : -1)
input.categories.forEach(c => delete c.count);

Object.keys(output).forEach(type => {
    if (!fs.existsSync(path.join(__dirname, 'labels'))) fs.mkdirSync(path.join(__dirname, 'labels'))

    fs.writeFileSync(path.join(__dirname, 'labels', `${type}_labels.json`), JSON.stringify(output[type]));
});

