fs = require('fs');
path = require('path');

const labelsPath = './labels.json';
const imagesPath = './t1_label_filter'

const input = JSON.parse(fs.readFileSync(labelsPath));
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

input.images.forEach(image => {
    let type = 'train';

    if (image.id >= Math.floor(input.images.length * 0.6) && image.id < Math.floor(input.images.length * 0.8)) type = 'val';
    if (image.id >= Math.floor(input.images.length * 0.8)) type = 'test';

    output[type].images.push(image);

    input.annotations.forEach(annotation => {
        if (annotation.image_id === image.id) output[type].annotations.push(annotation); 
    });

    if (!fs.existsSync(path.join(__dirname, 'images'))) fs.mkdirSync(path.join(__dirname, 'images'))
    if (!fs.existsSync(path.join(__dirname, 'images', type))) fs.mkdirSync(path.join(__dirname, 'images', type))

    const from = path.join(__dirname, imagesPath, image.file_name);
    const to = path.join(__dirname, 'images', type, image.file_name);

    fs.copyFileSync(from, to);
});

Object.keys(output).forEach(type => {
    if (!fs.existsSync(path.join(__dirname, 'labels'))) fs.mkdirSync(path.join(__dirname, 'labels'))
    if (!fs.existsSync(path.join(__dirname, 'labels', type))) fs.mkdirSync(path.join(__dirname, 'labels', type))

    fs.writeFileSync(path.join(__dirname, 'labels', type, `${type}_labels.json`), JSON.stringify(output[type]));
});

