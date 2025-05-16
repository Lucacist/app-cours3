-- Migration pour supprimer la colonne is_locked de la table courses
ALTER TABLE courses DROP COLUMN is_locked;
