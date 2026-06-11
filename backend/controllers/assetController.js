const Asset = require('../models/Asset');

// @desc    Get all assets (Searchable via query params)
// @route   GET /api/assets
// @access  Private (All logged-in users)
exports.getAssets = async (req, res) => {
  try {
    // If a search query is passed, we filter by name or category
    const keyword = req.query.keyword ? {
      $or: [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { category: { $regex: req.query.keyword, $options: 'i' } }
      ]
    } : {};

    const assets = await Asset.find({ ...keyword });
    res.json(assets);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching assets' });
  }
};

// @desc    Create a new asset
// @route   POST /api/assets
// @access  Private/Admin
exports.createAsset = async (req, res) => {
  try {
    const { name, category, description, quantity, status } = req.body;

    const asset = await Asset.create({
      name,
      category,
      description,
      quantity,
      status
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(400).json({ message: 'Invalid asset data provided' });
  }
};

// @desc    Update an existing asset
// @route   PUT /api/assets/:id
// @access  Private/Admin
exports.updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    
    res.json(asset);
  } catch (error) {
    res.status(400).json({ message: 'Error updating asset' });
  }
};

// @desc    Delete an asset
// @route   DELETE /api/assets/:id
// @access  Private/Admin
exports.deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findByIdAndDelete(req.params.id);
    
    if (!asset) return res.status(404).json({ message: 'Asset not found' });
    
    res.json({ message: 'Asset successfully removed' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting asset' });
  }
};