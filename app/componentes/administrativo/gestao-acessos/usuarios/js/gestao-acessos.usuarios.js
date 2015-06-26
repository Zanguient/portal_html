/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-usuarios", []) 

.controller("administrativo-usuariosCtrl", ['$scope','$state', function($scope,$state){ 
    
    // Cadastro
    $scope.tabCadastro = 1;
    
    // Inicialização do controller
    $scope.administrativoUsuariosInit = function(){
        // Título da página : Deixa o que gostaria que aparecesse...
        $scope.pagina.titulo = 'Gestão de Acessos';                          
        $scope.pagina.subtitulo = 'Usuários';
        // Carrega todos os handlers do layout
        /*jQuery(document).ready(function() { 
        //$rootScope.$on('$viewContentLoaded', function(){
           FormWizard.init(); 
        });*/
    };
    
    
    // CADASTRO
    
    // Modifica a tab atual
    $scope.setTabCadastro = function(tab) {
        $scope.tabCadastro = tab;
    };
    // Retorna true se a tab informada é a selecionada
    $scope.tabCadastroSelecionada = function(tab){
        return $scope.tabCadastro === tab;
    };
    
}]);