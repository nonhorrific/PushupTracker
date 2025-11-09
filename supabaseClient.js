class SupabaseClient {
  constructor() {
    this.supabaseUrl = 'https://bdhxuhpgbrfdrslsjtjw.supabase.co';
    this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkaHh1aHBnYnJmZHJzbHNqdGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjMxMTMsImV4cCI6MjA3ODIzOTExM30.DJbOrcOwQqdvvvwvP4dxtz6icTQeMD2ILl7G0HDl6Zg';
    this.apiUrl = `${this.supabaseUrl}/rest/v1`;
  }

  async syncPersonalBest(exerciseType, bestRepCount) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`,
        'Prefer': 'return=representation'
      };

      const checkResponse = await fetch(
        `${this.apiUrl}/personal_bests?exercise_type=eq.${exerciseType}`,
        {
          method: 'GET',
          headers: headers
        }
      );

      const existing = await checkResponse.json();

      if (existing && existing.length > 0) {
        const currentRecord = existing[0];
        if (bestRepCount > currentRecord.best_rep_count) {
          await fetch(
            `${this.apiUrl}/personal_bests?exercise_type=eq.${exerciseType}`,
            {
              method: 'PATCH',
              headers: headers,
              body: JSON.stringify({
                best_rep_count: bestRepCount,
                achieved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
            }
          );
        }
      } else {
        await fetch(
          `${this.apiUrl}/personal_bests`,
          {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              exercise_type: exerciseType,
              best_rep_count: bestRepCount,
              achieved_at: new Date().toISOString()
            })
          }
        );
      }

      return true;
    } catch (error) {
      console.error('Error syncing to Supabase:', error);
      return false;
    }
  }

  async getPersonalBest(exerciseType) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        'apikey': this.supabaseKey,
        'Authorization': `Bearer ${this.supabaseKey}`
      };

      const response = await fetch(
        `${this.apiUrl}/personal_bests?exercise_type=eq.${exerciseType}`,
        {
          method: 'GET',
          headers: headers
        }
      );

      const data = await response.json();
      if (data && data.length > 0) {
        return data[0].best_rep_count;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching from Supabase:', error);
      return 0;
    }
  }
}
