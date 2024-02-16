const db = require('_helpers/db');
const { cloneDeep } = require('lodash');
const uid = require('uid');
const axios = require('axios');

module.exports = {
    getAll,
    create,
    delete: _delete
};

async function getAll(page) {
    try {
        const limit = 15;
        const imageData = await db.Image.findAll({
          order: [
            ['createdAt', 'DESC'] // Order by the specified column and direction
          ],
          limit: limit,
          offset: parseInt(page - 1) * limit
        });
        
        return {
          code: 200,
          data: imageData,
          message: 'Request success'
        };
      } catch (error) {
        console.error('Error fetching data:', error);
        return {
          code: 200,
          data: [],
          message: 'Request success er'
        };
      }
}

async function create(req, res) {
    try {
        if (!req.file) {
            return null;
        }
      
        const apiUrl = 'https://api.imgbb.com/1/upload';
        const apiKey = 'baac259792bd9063f94732106d35add6'; // Replace with your actual API key
        const imageData = req.file.buffer.toString('base64') //'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

        const formData = new FormData();
        formData.append('image', imageData);

        const imgbbResponse = await axios.post(apiUrl, formData, {
            params: {
                key: apiKey,
            },
            headers: {
                'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            },
        })
    
        // Save image URL to the database
        const newImage = await db.Image.create({
            user_id: globalThis.currentId || '0567997c854559e4',
            image_id: uid.uid(16),
            category_id: req.query?.category_id,
            data: JSON.stringify(imgbbResponse.data.data),

        });

        const responseImg = cloneDeep(newImage);
        responseImg['data'] = JSON.parse(responseImg['data']);
    
        // res.json({ success: true, data:  newImage, message: 'Upload sucess' });
        return responseImg;
      } catch (error) {
        console.error('Error uploading image:', error.message);
        res.status(500).json({ success: false, error: error.message });
      }
}

async function _delete(id) {
    const image = await getImage(id);
    await image.destroy();
}

// helper functions

async function getImage(id) {
    const image = await db.Image.findOne({ where: { image_id: id } });
    if (!image) throw 'Image not found';
    return image;
}