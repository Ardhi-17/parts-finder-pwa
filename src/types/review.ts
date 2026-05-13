export type UserReview = {
   id: string;
   sender_name?: string | null;
   sender_role?: string | null;
   rating: number;
   review_text: string;
   is_visible: boolean;
   admin_note?: string | null;
   created_at?: string;
   updated_at?: string;
 };
 
 export type ReviewInput = {
   sender_name?: string;
   sender_role?: string;
   rating: number;
   review_text: string;
 };
 
 export type ReviewUpdateInput = {
   is_visible?: boolean;
   admin_note?: string;
 };