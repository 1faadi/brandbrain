// app/api/brand-variables/route.ts
import { QdrantClient } from '@qdrant/js-client-rest';
import { TogetherBGEEmbeddings } from '../../../lib/embeddings/bgeTogetherEmbeddings';
import { v4 as uuidv4 } from 'uuid';

const client = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});

const embeddings = new TogetherBGEEmbeddings({
  model: 'BAAI/bge-large-en-v1.5',
  apiKey: process.env.TOGETHER_API_KEY!,
});

// GET - Retrieve brand variables (simplified - no userId)
export async function GET(req: Request) {
  try {
    console.log('API: Getting brand variables...');
    
    // Get all points and find user brand variables
    const allResults = await client.scroll('brand-variables', {
      limit: 100,
      with_payload: true
    });

    console.log('API: Found', allResults.points?.length || 0, 'total points');

    // Find the user brand variables point
    const userVariables = allResults.points?.find(point => 
      point.payload?.type === 'user_brand_variables'
    );

    if (userVariables) {
      console.log('API: Found user brand variables:', userVariables.payload?.variables);
      return Response.json({ 
        success: true, 
        variables: userVariables.payload?.variables || {} 
      });
    }

    console.log('API: No user brand variables found');
    return Response.json({ 
      success: true, 
      variables: {} 
    });

  } catch (error) {
    console.error('API Error retrieving brand variables:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to retrieve brand variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Save brand variables (simplified - no userId)
export async function POST(req: Request) {
  try {
    const { variables } = await req.json();
    
    console.log('API: Saving brand variables:', Object.keys(variables));
    
    // Create content for embedding with length limits
    const variableText = Object.entries(variables)
      .filter(([key, value]) => typeof value === 'string' && value.trim() !== '')
      .map(([key, value]) => {
        // Truncate very long values to prevent embedding API issues
        const truncatedValue = typeof value === 'string' && value.length > 500 
          ? value.substring(0, 500) + '...' 
          : value;
        return `${key}: ${truncatedValue}`;
      })
      .join('\n');

    // Limit total content length
    const content = `User Brand Variables:\n${variableText}`;
    const finalContent = content.length > 2000 
      ? content.substring(0, 2000) + '...' 
      : content;
    
    console.log('API: Content length for embedding:', finalContent.length);
    
    // Generate embedding with error handling
    let vector;
    try {
      console.log('API: Generating embedding...');
      vector = await embeddings.embedQuery(finalContent);
      console.log('API: Embedding generated successfully');
    } catch (embedError) {
      console.error('API: Embedding generation failed:', embedError);
      
      // Fallback: Save without embedding (use zero vector)
      console.log('API: Using fallback zero vector');
      vector = new Array(1024).fill(0); // BGE embedding size
    }
    
    // Check if variables already exist
    let existingPointId = null;
    try {
      const existingResults = await client.scroll('brand-variables', {
        limit: 100,
        with_payload: true
      });

      const existingPoint = existingResults.points?.find(point => 
        point.payload?.type === 'user_brand_variables'
      );

      if (existingPoint) {
        existingPointId = existingPoint.id;
        console.log('API: Found existing point, will update:', existingPointId);
      } else {
        console.log('API: No existing point found, will create new');
      }
    } catch (scrollError) {
      console.log('API: Could not check for existing variables, creating new:', scrollError);
    }

    const pointId = existingPointId || uuidv4();

    // Upsert the variables
    console.log('API: Upserting to Qdrant with point ID:', pointId);
    await client.upsert('brand-variables', {
      points: [
        {
          id: pointId,
          vector: vector,
          payload: {
            content: finalContent,
            type: 'user_brand_variables',
            variables: variables, // Store full variables regardless of content truncation
            updatedAt: new Date().toISOString(),
            hasEmbedding: Array.isArray(vector) && vector.some(v => v !== 0)
          }
        }
      ]
    });

    console.log('API: Successfully saved brand variables');
    return Response.json({ 
      success: true, 
      message: 'Brand variables saved successfully',
      pointId: pointId
    });

  } catch (error) {
    console.error('API Error saving brand variables:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to save brand variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Reset brand variables (simplified - no userId)
export async function DELETE(req: Request) {
  try {
    console.log('API: Resetting brand variables...');
    
    // Find existing variables
    const existingResults = await client.scroll('brand-variables', {
      limit: 100,
      with_payload: true
    });

    const existingPoint = existingResults.points?.find(point => 
      point.payload?.type === 'user_brand_variables'
    );

    if (existingPoint) {
      console.log('API: Deleting existing point:', existingPoint.id);
      await client.delete('brand-variables', {
        points: [existingPoint.id]
      });
      
      return Response.json({ 
        success: true, 
        message: 'Brand variables reset successfully' 
      });
    } else {
      console.log('API: No brand variables found to delete');
      return Response.json({ 
        success: true, 
        message: 'No brand variables found to reset' 
      });
    }

  } catch (error) {
    console.error('API Error resetting brand variables:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to reset brand variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}