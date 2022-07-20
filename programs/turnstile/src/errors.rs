use anchor_lang::prelude::*;

#[error_code]
pub enum TurnstileError {
    #[msg("Turnstile is already unlocked!")]
    AlreadyUnlocked,
    #[msg("Unexpected user trying to push the turnstile!")]
    UnexpectedUser,
}
