Rails.application.routes.draw do

  devise_for :users

  devise_scope :user do
    # Development only, CSRF risk, signs user out
    get 'users/sign_out', to: 'devise/sessions#destroy'
  end
  
  root to: "home#index"

  resources :users
  resources :messages
  
end