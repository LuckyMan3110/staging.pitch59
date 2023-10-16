import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { of, Observable } from 'rxjs';

@Injectable()
export class MiTranslateLoaderService implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of({
      Username: 'Email',
      Password: 'Password',
      'Username is should be greater than x':
        'Username is should be greater than {{minval}}',
      forgot_password: 'Forgot password',

      grid_title: 'TITLE',
      grid_trial_start_date: 'START DATE',
      grid_trail_end_date: 'END DATE',
      grid_patients: 'PATIENTS',

      label_signup_its_free: 'Sign up real quick - it\'s free!',
      label_signup: 'Sign up',
      label_add_your_business: 'Add Your Business',
      label_first_name: 'First Name',
      label_last_name: 'Last Name',
      label_mobile_number: 'Mobile Number',
      label_email_address: 'Email Address',
      label_optional: '(Optional)',
      label_pitch_me: 'Pitch Me',
      label_unique_about_pitch: 'What’s unique about pitch59',
      label_video_pitch: 'VIDEO PITCH',
      label_video_pitch_text:
        '59 second sales pitch by an owner or employee.',
      label_reviews: 'REVIEWS',
      label_choose_button: 'CHOOSE BUTTON',
      label_choose_text:
        '“CHOOSE” button sending contact information both ways customers &amp; Business owners.',
      label_services: 'SERVICES',
      label_services_text:
        'Variety of industries' +
        '(music lessons, tutors, politicians, doctors, developers, plumbers, window cleaners, etc…)',
      label_faq: 'FAQs',
      label_choose: 'Choose',
      label_business_details: 'Business details',
      label_contact_details_address: 'Contact details & address',

      lbl_yes: 'Yes',
      lbl_no: 'No',
      label_password: 'Password',
      label_sign_in: 'Log in',
      label_verify_email_address: 'Verify email address',
      label_registered_mail_address: 'Enter registered email address',
      label_registed_info:
        'Please enter your email address to reset the password.',
      label_enter_digit_code: 'Enter digit code',
      label_verify: 'Verify',
      label_change_password: 'Change Password',
      label_old_password: 'Current Password',
      label_new_password: 'New Password',
      label_confirm_password: 'Confirm Password',
      label_change: 'Change',
      label_send: 'Send',
      label_send_code_phone: 'Text Code',
      label_send_code_email: 'Email Code',
      label_confirm: 'Confirm',
      err_required_emailId: 'Email ID required',
      err_invalid_emailId: 'Invalid Email ID',
      err_required_oldpassword: 'Current password required',
      err_required_password: 'Password required',
      err_required_confirmpassword: 'Confirmed password required',
      err_required_firstname: 'First name required',
      err_required_lastname: 'Last name required',
      err_required_contact: 'Mobile number required',
      err_required_digitCode: 'Code required',
      label_verify_onetime_password: 'Verify one time password',
      err_old_password_not_match: 'Current Password do not match',
      err_confirm_password_not_match:
        'Password & Confirm Password do not match',
      err_invalid_contact: 'Invalid Mobile Number',
      err_invalid_firstname: 'Invalid First Name',
      err_invalid_lastName: 'Invalid Last Name',
      err_invalid_digitCode: 'Invalid Code',
      err_account_not_found: 'Account not found',
      err_your_own_email: 'You cannot enter your own email address.',
      lbl_ref_email_updated: 'Referral Email Successfully Updated',
      lbl_edit_referral_email: 'Edit Referral Email',
      label_next: 'Next',
      label_previous: 'Previous',
      label_step_1_upload_video: 'STEP 1 of 2: Upload video',
      label_add_your_sale:
        'Add your sales pitch video (up to 59 seconds long)',
      label_uploading: 'Uploading...',
      label_uploading_video: 'Uploading video...',
      label_finishing_upload_video: 'Finishing video upload...',
      label_stand_by: 'Please stand by',
      label_uploaded: 'Uploaded',
      label_accepted_format: 'Accepted formats:',
      label_video_formats: 'AVI, FLV, MOV, MPEG4, MPEGPS, WebM and WMV.',
      label_image_formats: 'JPG, JPEG, PNG and BMP.',
      label_upload_video: 'UPLOAD VIDEO',
      label_picth_rules: 'VIDEO REQUIREMENTS:',
      label_video_seconds: '1. Video must be 59 seconds or less.',
      label_upload_video_rule1:
        '2. Sales pitch MUST be done by an OWNER or EMPLOYEE of the company' +
        ' (no paid actors, models, or computer animation).',
      label_upload_video_rule2:
        '3. No slander, illegal activity, profanity, vulgarity, nudity, sexual material or inappropriate' +
        ' behavior of any kind. Pitch59 reserves the right to refuse or remove any video we deem inappropriate. See Terms of Service.',
      label_upload_video_rule3:
        'If you are creating your sales pitch with a mobile device, be sure to take the video horizontally' +
        ' rather than vertically or it won’t appear correctly.',
      label_upload_video_rule4:
        'Be creative! Address the WHO, WHAT, WHY, and HOW of your business and let customers know what’s unique' +
        ' about you, your team, and your service. You’ve got the spotlight, microphone, and centerstage for 59 seconds,' +
        ' give your potential clients your best pitch!',
      label_how_much_it_costs: 'HOW MUCH DOES IT COST?',
      label_how_much_it_costs_subtext_two_doller:
        '$1/video click (each time someone watches your sales pitch). Note: we track the IP Addresses' +
        ' of consumers that view your pitch. You won’t be charged more than 1x/72 hour period' +
        ' if a customer watches your pitch multiple times.',
      label_how_much_it_costs_subtext_three_doller:
        '$7/Lead (when a customer contacts you.) NOTE: You will NOT be charged if the ' +
        'customer does not agree to transfer contact information after clicking the CONTACT button.',
      label_how_much_it_costs_subtext_minimum:
        '(Minimum of $5/month in click charges, No contracts, No annual fees)',
      label_upload_video_rule5:
        'Let customers know who you are, what makes you unique, and why they should choose you.',
      label_not_now: 'NOT NOW',
      label_proceed: 'PROCEED',
      label_cardholder_name: 'Cardholder Name',
      label_card_number: 'Card Number',
      label_expires_date: 'Expiration Date',
      label_cvv: 'CVC/CVV',
      err_cardholder_name_required: 'Cardholder name required',
      err_card_number_required: 'Card number required',
      err_expires_date_required: 'Expiration date required',
      err_cvv_required: 'CVC/CVV required',
      lbl_business_detail: ' Business Details',
      lbl_account_status: 'Account status:',
      lbl_account_status_msg:
        'Your account has been activated! Your business will now appear in search results and you can share your PitchCard!',
      lbl_business_details_step: 'STEP 2 of 2: Business Details',
      label_active: 'Active',
      label_inactive: 'Inactive',
      lbl_business_video_image: 'Business video & cover image',
      lbl_reupload_video: 'Reupload video',
      lbl_video_cover_photo: 'Video Cover Photo',
      lbl_cover_photo: 'Cover photo',
      lbl_video_cover_text:
        'Picture of the person presenting the sales pitch.',
      label_business_name: 'Business Name',
      label_business_alias: 'Business share link alias',
      label_business_category: 'Business category',
      label_business_subcategory: 'Business subcategory',
      label_business_email: 'Business Email',
      label_business_contact: 'Business contact number',
      label_website_link: 'Website link',
      label_address: 'Address',
      label_city: 'City',
      label_zip: 'Zip',
      label_state: 'State',
      label_location_business_coverage: 'Location and business coverage',
      label_search_your_business_location:
        'Enter your business location or the center of your service area.',
      label_drag_map_location:
        'Drag the map and point the pin to your business location',
      label_what_radius_you_like_text:
        'What would you like the advertising radius around your business to be (in miles)?',
      label_your_pricing_detail: '',
      label_business_pricing_model: 'Pricing/Hours',
      label_write_pricing_details:
        'Enter your hours of operation and basic pricing information. Be as detailed as you would like.',
      label_company_images: 'ATTACHMENTS',
      label_its_great_way_Showing_real:
        'Upload either individual or collective photos of all employees and other photos ' +
        ' you\'d like to show to potential clients.',
      label_select_payment_method: 'Select payment method',
      label_add_new_card: 'Add payment information',
      label_optional_monthly_budget: 'Monthly Budget',
      label_optional_method_limit_note: '(Minimum budget is $50)',
      label_save_as_draft: 'Save as Draft',
      label_add_business: 'Add Business',
      label_my_businesses: 'My Businesses',
      label_two_setp_verification: 'Two Step Verification',
      label_enter_code: 'Enter Code',
      label_invalid_otp: 'Invalid OTP',
      label_incorrect_otp: 'Incorrect code, please try again.',
      label_new_customers: 'New Customers',
      label_spendings: 'Spendings',
      label_monthly_budget_limit: 'Monthly budget limit',
      label_engagement: 'Engagement',
      label_analytics: 'Analytics',
      lbl_business_profile: 'Business Profile',
      label_update_business_details: 'Update business details',
      label_respond: 'Respond',
      label_customers: 'Customers',
      label_email: 'Email',
      label_date: 'Date',
      label_no_customers_available: 'No customers available.',
      lbl_payment_approved: 'Payment Approved',
      lbl_payment_approve_title: 'Great! You’re almost there!',
      lbl_after_payment_instructions:
        'Now just fill in the information on the rest of these tiles. After you’re done, your PitchCard will be waiting for you on your app home screen!',
      err_payment_failed: 'Payment Failed',
      err_payment_failed_no_funds: 'Not Sufficient Funds',
      err_payment_unsuccessful: 'Payment was unsuccessful',
      err_payment_description:
        'Please verify your billing information and try again.',
      err_required_buisnessname: 'Business name required',
      err_required_buisnessalias: 'Business share link alias required',
      err_required_category: 'Business category required',
      err_required_subcategory: 'Business subcategory required',
      err_required_subcaetgory_of_selected_categ:
        'Please select at least one category tag',
      err_required_phone_number: 'Phone number required',
      err_required_website_link: 'Website required',
      err_invalid_website_link: 'Invalid Website',
      err_required_address: 'Address required',
      err_required_city: 'City required',
      err_invalid_city: 'Invalid City',
      err_required_zip: 'ZIP Code required',
      err_invalid_zip: 'Invalid ZIP Code',
      err_required_state: 'State required',
      err_invalid_state: 'Invalid State',
      label_recruitment: 'Recruitment',
      lbl_video_resumes: 'Video Resumes',
      label_bills_payments: 'Bills & Payments',
      label_payment_methods: 'Payment Methods',
      label_expires: 'Expires',
      label_remove_card: 'Remove Card',
      label_change_billing_address: 'Change Billing Address',
      label_billing_address: 'Billing address',
      label_name: 'Name',
      label_contact_number: 'Contact number',
      label_update: 'Update',
      label_cancel: 'Cancel',
      err_required_name: 'Name required',
      err_invalid_name: 'Invalid Name',
      err_required_contact_number: 'Contact number required',
      err_number_exist: 'Contact number is already exist',
      label_save_As_favorite: 'Save',
      label_remove_As_favorite: 'Remove',
      label_pricing_info: 'Pricing Info',
      label_employer_portal: 'Employer Portal',
      err_invalid_zip_code: 'Invalid Zip code',
      err_invalid_buisnessname: 'Invalid Business Name',
      err_invalid_buisnessalias: 'Invalid Business share link alias',
      err_exists_buisnessalias:
        'Business share link alias already exists',
      err_required_location: 'Location required',
      err_invalid_radius: 'Radius required',
      label_my_profile: 'My profile',
      label_update_Profile: 'Update Profile',
      label_chosen_history: 'Chosen History',
      label_search_by_name: 'Search by name or industry',
      txt_position_remote: 'This position is remote',
      txt_default_job_location: '',
      label_add_new_business: 'Add New Business',
      label_video_reference_rules: 'VIDEO REFERENCE REQUIREMENTS:',
      label_video_testimonial_rules: 'VIDEO TESTIMONIAL REQUIREMENTS:',

      label_upload_testimonial: 'Upload Testimonial',
      label_upload_reference: 'Upload Reference',
      label_add_your_testimonial:
        'Add your testimonial video up to 29 seconds long.',
      label_add_your_reference:
        'Add your reference video up to 29 seconds long.',
      label_rule_1_testimonial:
        '1. Video MUST be 29 seconds or less, no exceptions.',
      label_rule_1_reference:
        '1. Reference video MUST be 29 seconds or less, no exceptions.',

      // tslint:disable-next-line: max-line-length
      label_rule_2_testimonial: '2. The video must show your face.',
      label_rule_3_testimonial:
        '3. No  fake testimonials, slander, illegal activity, profanity, vulgarity, nudity, sexual, or inappropriate content of any kind.',
      label_rule_4_testimonial:
        'Please leave an honest, personal testimonial of this person or organization.',
      label_rule_4_reference:
        'Please leave an honest, personal reference of this person or organization.',
      label_rule_5_testimonial:
        'By uploading or recording a testimonial, you agree with these terms.',
      label_rule_5_reference:
        'By uploading or recording a reference, you agree with these terms.',
      label_rule_terms_service:
        'Pitch59 Inc. reserves the right to remove any testimonial at any time. See',
      label_rule_terms_service_reference:
        'Pitch59 Inc. reserves the right to remove any reference at any time. See',

      label_reupload_video: 'Reupload video',
      label_rate_your_experience: 'Rate your experience',
      label_prev: 'previous',
      label_submit: 'Submit',
      label_share: 'Share',
      label_select: 'Select',
      label_report: 'Report',
      label_search: 'Search',
      label_search_by_customer: 'Search customer by name or email…',
      msg_business_added_success: 'Business added successfully.',
      msg_business_updated_success: 'Business updated successfully.',
      label_approval_pending: 'Approval Pending',
      label_approved_by_pitch59: 'Approved by pitch59',
      label_draft_saved: 'Draft Saved',
      label_published: 'Published',
      label_deactivated: 'Inactive',
      label_rejecteded: 'Rejected',
      label_delete: 'DELETE',
      msg_video_details_fetch_error:
        'Error occurred while fetching video details.',
      err_invalid_password_length:
        'The password must contain at least 8 alpha-numeric characters',
      label_favorites: 'Pockets',
      lbl_card_details: 'No card details available.',
      msg_fill_madatory_fields: 'Please fill all mandatory fields.',
      confirm_delete_images:
        'Please confirm that you would like to delete this image.',
      label_done: 'Done',
      label_confirmation: 'Confirmation',
      label_contact: 'Contact',
      label_apply_now: 'Apply Now',
      label_contacted: 'Contacted',
      lbl_registration_done_successful: 'Successfully registered',
      label_search_thumbnail_para:
        'Company contact information has been texted and emailed to you and can be found in your' +
        ' "Contact History" in your profile.',
      label_upload: 'Upload',
      label_business_logo: 'Business Logo',
      confirm_reupload_video:
        'Are you sure you want to reupload the video?',
      lbl_no_business_details_avail:
        'No business details available. Please add your business.',
      lbl_no_favorite_details_avail: 'No favorite details available.',
      err_required_pricing: 'Pricing required',
      lbl_slect_comapny_images: 'Please select company image.',
      lbl_card_details_invalid:
        'Something went wrong with card details. Please check.',
      err_server: 'There was an unspecified server error.',
      lbl_coming_soon: 'Coming Soon',
      lbl_no_favorites_details_avail: 'No pockets details available.',
      lbl_reject_reasons: 'Reject Reasons',
      lbl_pay_method_and_billsandpay: 'Billing',
      lbl_business_response: 'Business Response',
      lbl_customer_service: ' Customer Service',
      lbl_alias_note_text:
        '(You can change alias only until the business is approved, so choose wisely!)',
      lbl_business_category_note_text:
        '(Select all the categories and subcategories you service. )',
      lbl_quality: 'Quality',
      lbl_no_contacted_details_avail: 'No contact details available',
      lbl_wehave_sent_four_digitcode: 'We have sent a digit code to',
      lbl_resend_otp: 'Resend OTP',
      label_reset_password: 'Reset Password',
      label_reset: 'Reset',
      lbl_by_registering:
        'By signing up, you confirm that you accept the',
      lbl_terms_conditions: 'Terms of Service',
      lbl_and: 'and',
      lbl_privacy_policy: 'Privacy Policy',
      lbl_already_acc: 'Already have an account?',
      lbl_signup: 'Sign Up',
      lbl_signin: 'Sign In',
      lbl_dont_have_acc: 'Don’t have an account?',
      lbl_contact_history: 'Contact History',
      lbl_history: 'History',
      lbl_logout: 'Logout',
      label_unique: 'What’s unique',
      lbl_home: 'Home',
      lbl_faqs: 'FAQ’s',
      lbl_copy_rights: `© ${new Date().getFullYear()} Pitch59 Inc. All rights reserved.`,
      lbl_crop_and_upload: 'Crop & Upload',
      lbl_video_sales_pitch: 'VIDEO SALES PITCH',
      lbl_contact_button: 'CONTACT BUTTON',
      // tslint:disable-next-line: max-line-length
      lbl_contact_button_subtext:
        'Clicking the contact button will swap both your and this business\'s contact information with each other via text and email.',
      lbl_unbiased_carousel: 'UNBIASED CAROUSEL',
      lbl_unbiased_carousel_subtext:
        'Search results show up in an ' +
        'unbiased carousel, no company can buy their way to the top of pitch59.' +
        '' +
        ' Consumers get to pick the winners and losers, not us.',
      lbl_sales_pitch_video: 'Sales Pitch Video',
      lbl_two_doller: '$2 ',
      lbl_sales_pitch_video_subtext_bold:
        'Each time someone watches your sales pitch. ',
      lbl_sales_pitch_video_subtext:
        '(We track the IP Addresses of consumers that view your pitch. You won’t be charged more' +
        ' than 1x/72 hour period if a customer watches your pitch multiple times.)',
      lbl_choose_click: 'CONTACT Click',
      lbl_three_doller: '$3 ',
      lbl_choose_click_subtext_bold: 'When a customer contacts you. ',
      lbl_share_your_pitch_card_online: 'Share your PitchCard online,',
      lbl_choose_click_subtext:
        '(NOTICE: You will NOT be charged if the customer does not agree to the transfer of contact' +
        ' information after clicking the CONTACT button.)',
      label_respond_subtext:
        'Thank you for contacting our team at Pitch59! We care about our customers and appreciate' +
        'your comments as we continually strive to improve our services.  We’ll contact you as soon as we are able.',
      label_review_notes: ' of 300 charater(s)',
      lbl_unlimited_sharing_content: `text, email, and print for $25/mo. All video clicks and leads are included at no additional charge.`,
      label_update_card_title: 'UPDATE CARD',
      confirm_update_card:
        'Please confirm that you would like to update your credit card. Otherwise current card information will be lost it',
      lbl_remove_ach_title: 'REMOVE Bank Account',
      confirm_remove_ach:
        'Please confirm that you would like to remove this bank account.',
      label_filter: 'Filter',
      err_reported_issues_required: 'Please select any one option.',
      lbl_accept_terms_and_conditions:
        'Please accept Terms of Service & Privacy Policy',
      lbl_thanks_for_reporting: ' Thanks for reporting',
      lbl_back: 'Back',
      lbl_sexual_content: 'Sexual content',
      lbl_violent_or_repulsive_content: 'Violent or repulsive content',
      lbl_hateful_or_abusive_content: 'Hateful or abusive content',
      lbl_harmfulor_dangerous_acts: 'Harmful or dangerous acts',
      lbl_spam_or_misleading: 'Spam or misleading',
      lbl_add_card_details: ' Please add card details.',
      lbl_note_accepted_video_formats: 'Note: Accepted video formats',
      lbl_please_select_valid_video_format:
        'Please select a valid video format',
      lbl_please_select_valid_image_format:
        'Please select a valid image format',
      lbl_file_limit_err: 'Please select only 1 file',
      lbl_file_limit_size_err: 'Please select file less than 10Mb',
      lbl_error_in_upload_try_again:
        'Your internet connection is slow; please upload video again.',
      lbl_referral_commission: 'Referral Commissions',
      lbl_referrals: 'Referrals',
      lbl_respond_text_required: 'Response required',
      label_refer_business_friends: 'Refer Business Friends',
      label_refer: 'Refer',
      label_referred_by: 'Referred By',
      label_referred_email: 'Email Address of Referrer',
      label_zip_code: 'Zip code',
      lbl_sign_out: 'Log out',
      label_sign_up: 'Sign up',
      label_pricing: 'Pricing',
      label_Search: 'Search PitchCards',
      label_sign_up_caps: 'SIGN UP',
      label_sign_in_caps: 'LOG IN',
      label_status: 'Status',
      label_joined: 'Joined',
      label_invited: 'Invited',
      label_commission: 'Commission',
      label_resend: 'Resend',
      label_receipt: 'Receipt',
      lbl_video_size_exceeds_300_mb:
        '300 MB video size limit exceeded. Please reduce video size.',
      lbl_video_duration_exceeds_59_seconds:
        '59 seconds video duration limit exceeded. Please reduce video duration.',
      lbl_video_duration_exceeds_29_seconds:
        '29 seconds video duration limit exceeded. Please reduce video duration.',
      label_user_name: 'User Name',
      label_refer_business_commision_text:
        'Refer businesses to earn commission',
      label_provide_refer_details:
        'Help your friend\'s business grow' +
        ' and earn a 5% commission on their monthly charges for the first 3 years!',
      label_thank_you_for_refering_business:
        'Thanks for referring Pitch59!',
      label_refer_email_sent_text:
        'If you\'ve entered your bank account information, ' +
        'you\'ll start receiving commissions when your friend signs up and starts advertising on Pitch59!' +
        ' It\'s always a good idea to follow up with your referral to see if they were able to create their profile too',
      label_five_commission:
        'Once your referral joins Pitch59, you will get 5% commission based on their spendings.',
      label_current_commission: 'Current commission',
      label_current_commission_subtext:
        'Commissions will be deposited monthly into your bank account.',
      label_bank_of_america: 'Bank of America',
      msg_business_share_subject: 'You\'ve received a PitchCard!',
      msg_pocket_share_subject: 'You\'ve received a Pocket!',
      msg_business_share_desc:
        'I really like this company and thought you might want to check them out too. Have a great day!',
      msg_business_share_desc_resume:
        'I really like this applicant and thought you might want to check them out too.',
      msg_pocket_share_desc:
        'I found some great PitchCards I thought you would be interested in and wanted to share them with you. I created a Pocket with them in it so you could find them all in one place.\n' +
        'Have a great day!',
      label_search_by_business_name: 'Search by business name',
      label_search_by_user_name: 'Search by user name',
      label_share_header:
        'How would you like to share this company\'s PitchCard?',
      label_share_pocket_header:
        'How would you like to share this pocket?',
      // tslint:disable-next-line: max-line-length
      label_share_header_after_review_upload:
        'Please help this company grow by sharing their PitchCard on one of your social media pages or with friends. Thanks!',
      label_name_or_account: 'Account holder name',
      label_account_holder_type: 'Account holder type',
      label_routing_number: 'Routing number',
      label_account_number: 'Account number',
      label_confirm_number: 'Confirm account number',
      label_thank_u_for_contacting_us: 'Thank you for contacting us.',

      label_business_friends_name: 'Business Friend\'s Name',
      label_month: 'Month',
      label_amount_due: 'Amount Due',
      label_invoice: 'Invoice',
      label_payment_and_reciept: 'Payment Status & Receipt',
      lbl_no_bills_and_payments_avail:
        'No bill/payment details available.',
      label_add_bank_account: 'Add bank account',
      err_required_label_routing_number: 'Routing number required',
      err_required_label_account_number: 'Account number required',
      err_confirm_account_number_not_match:
        'Confirm that account number doesn’t match.',
      err_required_Confirm: 'Confirmed account number required',
      err_required_label_name_or_account:
        'Account holder’s name required',
      err_required_label_account_holder_type:
        'Please select account holder type.',
      label_remove: 'Remove',
      label_edit: 'Edit',
      label_bank_status: 'Status',
      label_company_id: 'Company Id',
      label_add_your_bank_account: 'Add your bank account',
      label_edit_your_bank_account: 'Edit your bank account',
      label_update_your_bank_account: 'Update your bank account',
      label_adding_bank_acc_para:
        'Adding your bank account enables Pitch59 to deposit your commissions directly into your account.',
      err_invalid_routing_number: 'Invalid routing number',
      err_invalid_account_number: 'Invalid account number',
      lbl_bank_details_invalid: 'Invalid bank details. Please correct.',
      label_delete_bank_details: 'Delete Bank Details',
      confirm_delete_bank_details:
        'Please confirm that you would like to remove this bank account.',
      label_lost_changes: 'Unsaved changes',
      message_lost_changes:
        'You have unsaved data. If you close this window without saving all data will be lost',
      message_retry_payment: 'Do you really want to retry payment?',
      lbl_retry_payment: 'Retry payment',
      label_individual: 'Individual',
      label_company: 'Company',
      err_only_numerics_allowed: 'Please enter only numeric digits.',
      err_only_characters_allowed: 'Please enter characters only.',
      label_save_continue: 'Save and Continue',
      label_save_finish: 'Save and finish',
      label_add_your_cover_image: 'Add your cover image',
      label_company_info: 'Company Information',
      label_hide_address_field: 'Hide your address from customers',
      label_advertising_area: 'Advertising area',
      label_photos_pricing: 'Photos & Pricing',
      label_payment_budget: 'Payment & Budget',
      label_submit_for_approval: ' Submit for approval',
      err_min_budget_is_fifty: 'Minimum budget is $50.',
      label_usd: 'USD',
      label_please_upload_video: 'Please upload video.',
      label_please_upload_video_cover: 'Please upload cover image.',
      label_video_pitch_cover_photo: 'video pitch, cover photo, logo',
      label_saved: 'Saved',
      lbl_pitch_video: 'Pitch video',
      lbl_company_logo: 'Company logo',
      lbl_add_your_company_logo:
        'Add your company logo to your PitchCard.',
      lbl_change_cover_photo: 'Change cover photo',
      lbl_add_logo: 'Add logo',
      label_remove_logo: 'Remove',
      label_save: 'Save',
      err_required_mothly_budget: 'Monthly budget required',
      label_add_your_business_logo: 'Add your business logo',
      label_upload_video_cover: 'UPLOAD VIDEO COVER',
      label_upload_business_logo: 'UPLOAD BUSINESS LOGO',
      label_payment_method: 'Payment method',
      label_scroll_in_out: '*** Scroll in or out to make logo fit ***',
      label_getting_video_thumbnail:
        'Please wait until video has finished processing.',
      label_pitch59_rules_for_videos: ' Pitch59 video requirements:',
      label_search_carousel_contacted_text:
        'Company information can be found in Contact History.',
      label_common_msg_for_card_was_declined:
        'Your card was declined. Please re-enter your card information.',
      label_submitted_for_approval_confirm_message:
        'Congratulations, your account has been submitted for approval! We\'ll ' +
        'review your information shortly.',
      label_card_number_tooltip_text: 'Enter your card number here.',
      label_cvv_tooltip_text: 'Enter your CVV here.',
      label_pricing_hours_notes: ' of 500 character(s)',
      confirm_activate_business_status:
        'Please confirm that you would like to activate this business account.',
      label_activate_business_status: 'Account Activation Status',
      msg_business_acc_status_activated_success:
        'Business account has been activated.',
      confirm_inactivate_business_status:
        'Please confirm that you would like to deactivate this business account.',
      label_inactivate_business_status: 'Account Deactivation Status',
      msg_business_acc_status_inactivated_success:
        'Business account has been deactivated.',
      label_header_submitted_for_approval: 'Submitted for Approval',
      label_contact_us: 'Help Center',
      label_message: 'Message',
      err_required_message: 'Message required',
      err_required_date_format:
        'Please insert the date in mm/yyyy format.',
      label_share_pitchcard: 'Share PitchCard',
      label_refer_friend: 'Refer a Friend',
      label_pitchbox: 'PitchBox',
      label_my_account: 'My Account',
      lbl_enter_contact_number: 'Enter Phone Number',
      lbl_contact: 'Contact',
      label_resend_contact_info: 'Resend Contact Info',
      required_contact_number: 'Phone number required',
      label_share_pitch_card: 'Share A Pitch Card',
      label_my_business: 'My Business',
      label_share_pitch_59: 'Share Pitch59',
      lable_search_business_for_share: 'Search for a business to share',
      lbl_no_business_details_found: 'No business details available.',
      label_message_here: 'Write message…',
      label_refer_a_business: 'Refer a Business',
      lbl_remove_video: 'Remove video',
      lbl_remove_cover: 'Remove cover',
      lbl_remove_logo: 'Remove logo',
      // tslint:disable-next-line: max-line-length
      lbl_refer_text_msg:
        'Hey, I thought you might be interested in creating a video business card on Pitch59.com where you can market your sales pitch to everyone with the click of a button! If you are, you can sign up here.',
      err_wait_video_uploading:
        'Please wait until the video has finished uploading.',
      lbl_video_uploaded_successfully: 'Video successfully uploaded.',
      lbl_video_click_monthly_budget_at_least_50$:
        'Please enter a Video-Click Monthly Budget of at least $50 to continue.',

      lbl_unlimited_sharing: 'UNLIMITED SHARING',
      lbl_video_clicks: 'VIDEO CLICKS',
      lbl_leads: 'LEADS',
      lbl_$25_this_includes: '$25 / mo.  This includes:',
      lbl_$2video_click_search_directory:
        '$1 / Video Click in the Search Directory',
      lbl_$3_lead: '$7 / Lead',
      lbl_conatct_click_with_verified_info:
        '(Lead (contact click) with verified information being sent both ways)',
      // tslint:disable-next-line: max-line-length
      lbl_video_click_description: `The Video-Click Monthly Budget is the maximum amount you are allocating to spend for video clicks in the Search Directory. <br/>
      You will not be charged for clicks on a shared PitchCard (those are included in Unlimited Sharing). <br/>
      If someone watches your video multiple times from the same IP address, you will only be charged once per 72 hour period.`,
      lbl_min_$50: ' (Min. $50)',
      lbl_are_you_sure_want_to_delete_card:
        'Please confirm that you would like to remove this card.',

      // Images Alt Text
      lbl_img_alt_logo: 'Pitch59 Company Logo',
      lbl_img_alt_cover: 'Pitch59 Cover Photo',
      label_create_your_pitch_card: 'Create Your PitchCard',
      label_create_a_pitch_card: 'Create A PitchCard',
      label_browse_pitch_cards: 'Browse PitchCards',
      get_started_free: 'Get started with your free personal account',

      msg_success_copy: 'Copied to clipboard',

      msg_only_for_desktop: 'Available only on Desktop version'
    });
  }
}
