import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecommendationQuestion {
  id: number;
  question: string;
  question_type: string;
  options?: any[];
  category: string;
  is_required: boolean;
  order: number;
}

export interface RecommendationQuestionsResponse {
  success: boolean;
  data: RecommendationQuestion[];
  total: number;
}

export interface RecommendedProperty {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
  rooms: number;
  baths: number;
  beds: number;
  gender: string;
  available_spots: number;
  bills_included: boolean;
  matching_percentage: number;
  reason?: string;
  university_id?: number;
  accommodation_type?: string;
}

export interface RecommendationResponse {
  success: boolean;
  data: RecommendedProperty[];
  session_id: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch all recommendation questions
   */
  getQuestions(): Observable<RecommendationQuestionsResponse> {
    return this.http.get<RecommendationQuestionsResponse>(`${this.apiUrl}/questions`);
  }

  /**
   * Submit answers and get recommendations
   */
  getRecommendations(answers: any): Observable<RecommendationResponse> {
    return this.http.post<RecommendationResponse>(`${this.apiUrl}`, {
      answers: answers
    });
  }

  /**
   * Get recommendation history
   */
  getHistory(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/history`);
  }

  /**
   * Group questions by category
   */
  groupQuestionsByCategory(questions: RecommendationQuestion[]): Map<string, RecommendationQuestion[]> {
    const grouped = new Map<string, RecommendationQuestion[]>();

    questions.forEach(q => {
      if (!grouped.has(q.category)) {
        grouped.set(q.category, []);
      }
      grouped.get(q.category)!.push(q);
    });

    return grouped;
  }

  /**
   * Get categories in order
   */
  getCategoriesInOrder(questions: RecommendationQuestion[]): string[] {
    const categories: string[] = [];
    const seenCategories = new Set<string>();

    // Sort questions by order and collect unique categories
    questions
      .sort((a, b) => a.order - b.order)
      .forEach(q => {
        if (!seenCategories.has(q.category)) {
          categories.push(q.category);
          seenCategories.add(q.category);
        }
      });

    return categories;
  }
}
