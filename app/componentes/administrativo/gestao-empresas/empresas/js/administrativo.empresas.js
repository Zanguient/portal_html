/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-empresas", []) 

.controller("administrativo-empresasCtrl", ['$scope',
                                            '$state',
                                            '$campos',
                                            '$webapi',
                                            '$apis',
                                            '$autenticacao', 
                                            function($scope,$state,$campos,
                                                     $webapi,$apis,$autenticacao){ 

    var divPortletBodyEmpresaPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo usuário
    $scope.empresas = [];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.busca = ''; // model do input de busca                                            
    $scope.empresa = {busca:'', itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                     };                                            
                                                
    $scope.modalEmpresa = {titulo : ''}                                            
                                                
    // Inicialização do controller
    $scope.administrativo_empresasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Empresas';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state){
            $state.go(state);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Refaz a busca
            $scope.buscaEmpresas();
        }); 
        // Busca empresas
        $scope.buscaEmpresas();
    };
    
    // PERMISSÕES
    /**
      * Retorna true se o usuário pode consultar outras empresas
      */
    $scope.usuarioPodeConsultarEmpresas = function(){
        return $scope.PERMISSAO_ADMINISTRATIVO && !$scope.grupoempresa;    
    }                                            
    /**
      * Retorna true se o usuário pode cadastrar empresas
      */
    $scope.usuarioPodeCadastrarEmpresas = function(){
        return $scope.usuarioPodeConsultarEmpresas();  
               // && TEM PERMISSAO DO METODO POST    
    }
    /**
      * Retorna true se o usuário pode alterar info de empresas
      */
    $scope.usuarioPodeAlterarEmpresas = function(){
        return $scope.usuarioPodeConsultarEmpresas(); 
               // && TEM PERMISSAO DO METODO UPDATE
    }
    /**
      * Retorna true se o usuário pode excluir empresas
      */
    $scope.usuarioPodeExcluirEmpresas = function(){
        return $scope.usuarioPodeConsultarEmpresas();
               // && TEM PERMISSAO DO METODO DELETE
    }
    
    
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.empresa.total_paginas){ 
           $scope.empresa.pagina = pagina;
           $scope.buscaEmpresas(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.empresa.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.empresa.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.setaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.empresa.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaEmpresas();   
    };
                                                
                                                
    // BUSCA
    $scope.resetaBusca = function(){
        $scope.busca = '';
        $scope.filtraEmpresas();
    };
    $scope.filtraEmpresas = function(){
        $scope.empresa.busca = $scope.busca;
        $scope.buscaEmpresas();
    };
    $scope.buscaEmpresas = function(){

       $scope.showProgress(divPortletBodyEmpresaPos);    
        
       var filtros = undefined;
       
       // Verifica se tem algum valor para ser filtrado    
       if($scope.empresa.busca.length > 0) filtros = {id: $campos.cliente.grupoempresa.ds_nome, 
                                                      valor: $scope.empresa.busca + '%'};        
        
       $webapi.get($apis.getUrl($apis.cliente.grupoempresa, 
                                [$scope.token, 1, $campos.cliente.grupoempresa.ds_nome, 0, 
                                 $scope.empresa.itens_pagina, $scope.empresa.pagina],
                                filtros)) 
            .then(function(dados){
                $scope.empresas = dados.Registros;
                $scope.empresa.total_registros = dados.TotalDeRegistros;
                $scope.empresa.total_paginas = Math.ceil($scope.empresa.total_registros / $scope.empresa.itens_pagina);
                var registroInicial = ($scope.empresa.pagina - 1)*$scope.empresa.itens_pagina + 1;
                var registroFinal = registroInicial - 1 + $scope.empresa.itens_pagina;
                if(registroFinal > $scope.empresa.total_registros) registroFinal = $scope.empresa.total_registros;
                $scope.empresa.faixa_registros =  registroInicial + '-' + registroFinal;
                
                // Verifica se a página atual é maior que o total de páginas
                if($scope.empresa.pagina > $scope.empresa.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Esconde o progress
                $scope.hideProgress(divPortletBodyEmpresaPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else $scope.showAlert('Houve uma falha ao requisitar empresas (' + failData.status + ')', true, 'danger', true);
                 // Esconde o progress
                $scope.hideProgress(divPortletBodyEmpresaPos);
              }); 
    };  
                                                
                                                
                                                
    // AÇÕES
    $scope.verFiliais = function(empresa){
        console.log("VER FILIAIS DE " + empresa.ds_nome);     
    };
    $scope.cadastraNovaEmpresa = function(){
        $scope.modalEmpresa.titulo = 'Cadastro de Empresa';
        $('#modalEmpresa').modal('show');    
    };
    /**
      * Excluir efetivamente a empresa
      */
    var excluiEmpresa = function(id_grupo){
        console.log("EXCLUIR " + id_grupo);    
    };
    /**
      * Solicitação confirmação para excluir a empresa
      */
    $scope.excluirEmpresa = function(empresa){
        $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja excluir ' + empresa.ds_nome.toUpperCase(),
                         excluiEmpresa, empresa.id_grupo,
                         'Sim', 'Não');
    };
    /**
      * Edita a empresa
      */
    $scope.editarEmpresa = function(empresa){
        console.log("EDITA EMPRESA " + empresa.ds_nome);
    };                                            
                                               
                                                
}]);