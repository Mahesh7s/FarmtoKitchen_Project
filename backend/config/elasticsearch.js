const elasticsearch = require('elasticsearch');

const esClient = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  log: 'info'
});

// Create product index
const createProductIndex = async () => {
  try {
    const exists = await esClient.indices.exists({ index: 'products' });
    
    if (!exists) {
      await esClient.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
              name: { type: 'text', analyzer: 'english' },
              description: { type: 'text', analyzer: 'english' },
              category: { type: 'keyword' },
              price: { type: 'float' },
              isOrganic: { type: 'boolean' },
              isSeasonal: { type: 'boolean' },
              farmerName: { type: 'text' },
              farmLocation: { type: 'geo_point' },
              tags: { type: 'keyword' },
              rating: { type: 'float' },
              createdAt: { type: 'date' }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Elasticsearch index creation error:', error);
  }
};

// Index a product
const indexProduct = async (product) => {
  try {
    await esClient.index({
      index: 'products',
      id: product._id.toString(),
      body: {
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        isOrganic: product.isOrganic,
        isSeasonal: product.isSeasonal,
        farmerName: product.farmer?.farmName,
        farmLocation: product.farmer?.farmLocation?.coordinates,
        tags: product.tags,
        rating: product.rating?.average,
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    console.error('Elasticsearch indexing error:', error);
  }
};

// Advanced search
const advancedSearch = async (query) => {
  try {
    const { 
      searchTerm, 
      category, 
      minPrice, 
      maxPrice, 
      organic, 
      location, 
      radius = 10, // km
      sortBy = 'rating',
      sortOrder = 'desc'
    } = query;

    const mustConditions = [];

    // Full-text search
    if (searchTerm) {
      mustConditions.push({
        multi_match: {
          query: searchTerm,
          fields: ['name^3', 'description^2', 'tags', 'farmerName'],
          fuzziness: 'AUTO'
        }
      });
    }

    // Filters
    if (category) {
      mustConditions.push({ term: { category } });
    }

    if (organic !== undefined) {
      mustConditions.push({ term: { isOrganic: organic } });
    }

    // Price range
    const priceRange = {};
    if (minPrice) priceRange.gte = minPrice;
    if (maxPrice) priceRange.lte = maxPrice;
    if (Object.keys(priceRange).length > 0) {
      mustConditions.push({ range: { price: priceRange } });
    }

    // Location-based search
    if (location && location.lat && location.lng) {
      mustConditions.push({
        geo_distance: {
          distance: `${radius}km`,
          farmLocation: {
            lat: location.lat,
            lon: location.lng
          }
        }
      });
    }

    const searchBody = {
      query: {
        bool: {
          must: mustConditions
        }
      },
      sort: [
        { [sortBy]: { order: sortOrder } },
        { _score: { order: 'desc' } }
      ],
      highlight: {
        fields: {
          name: {},
          description: {}
        }
      }
    };

    const result = await esClient.search({
      index: 'products',
      body: searchBody
    });

    return result.hits.hits.map(hit => ({
      ...hit._source,
      id: hit._id,
      highlight: hit.highlight
    }));
  } catch (error) {
    console.error('Elasticsearch search error:', error);
    throw error;
  }
};

module.exports = {
  esClient,
  createProductIndex,
  indexProduct,
  advancedSearch
};