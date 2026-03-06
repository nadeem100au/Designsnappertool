import { supabase } from './client';

export const saveAudit = async (userId: string, data: any, imageUrl: string, projectName: string = 'Untitled Project') => {
    try {
        const { data: result, error } = await supabase
            .from('audits')
            .insert([
                {
                    user_id: userId,
                    thumbnail_url: imageUrl,
                    project_name: projectName,
                    analysis_data: data,
                },
            ])
            .select()
            .single();

        if (error) {
            console.error('Error saving audit:', error);
            throw error;
        }

        // --- Clean up old audits (keep only latest 5) ---
        try {
            const { data: userAudits, error: fetchError } = await supabase
                .from('audits')
                .select('id')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (!fetchError && userAudits && userAudits.length > 5) {
                const auditsToDelete = userAudits.slice(5).map(a => a.id);
                const { error: deleteError } = await supabase
                    .from('audits')
                    .delete()
                    .in('id', auditsToDelete);

                if (deleteError) {
                    console.error('Error deleting old audits:', deleteError);
                }
            }
        } catch (cleanupError) {
            console.error('Error during audit cleanup:', cleanupError);
            // Don't throw here so we still return the saved audit successfully
        }
        // ------------------------------------------------

        return result;
    } catch (error) {
        console.error('Error in saveAudit:', error);
        throw error;
    }
};

export const getUserAudits = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('audits')
            .select('id, user_id, project_name, thumbnail_url, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error fetching user audits:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in getUserAudits:', error);
        throw error;
    }
};

export const getAuditById = async (auditId: string) => {
    try {
        const { data, error } = await supabase
            .from('audits')
            .select('*')
            .eq('id', auditId)
            .single();

        if (error) {
            console.error('Error fetching audit by ID:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in getAuditById:', error);
        throw error;
    }
};
