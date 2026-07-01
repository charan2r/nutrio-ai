import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { MealModule } from './modules/meal/meal.module';
import { UserModule } from './modules/user/user.module';
import { AllergyModule } from './modules/allergy/allergy.module';
import { AiModule } from './modules/ai/ai.module';
import { ProfileModule } from './modules/profile/profile.module';
import { MealPlanModule } from './modules/meal-plan/meal-plan.module';
import { MealScoreModule } from './modules/meal-score/meal-score.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { UserPreferencesModule } from './modules/user-preferences/user-preferences.module';
import { MealItemsModule } from './modules/meal-items/meal-items.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports:[
    ConfigModule.forRoot({
      isGlobal: true,
    }), AuthModule, MealModule, UserModule, AllergyModule, AiModule, ProfileModule, MealPlanModule, MealScoreModule, FeedbackModule, UserPreferencesModule, MealItemsModule],
})
export class AppModule {}
